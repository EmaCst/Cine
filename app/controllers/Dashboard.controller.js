const db = require("../models");
const ventas = db.ventas;
const Pago = db.pagos;
const Reserva = db.reservas;
const Funcion = db.funciones;
const Sala = db.salas;
const Sucursal = db.sucursales;
const VentaDetalle = db.ventadetalles;
const Combo = db.combos;
const Pelicula = db.peliculas;
const sequelize = db.sequelize;

// ==========================
// 1️⃣ Ventas Totales
// ==========================
exports.getVentasTotales = async (req, res) => {
  try {
    const IVA = 0.12;
    const totalVentas = await ventas.sum("total") || 0;
    const totalIVA = totalVentas * IVA;
    const totalConIVA = totalVentas + totalIVA;

    res.json({
      totalVentas,
      totalIVA,
      totalConIVA,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================
// 2️⃣ Ventas por Sucursal
// ==========================
exports.pagosPorSucursal = async (req, res) => {
  try {
    const resultados = await Pago.findAll({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('subtotal')), 'subtotalTotal'],
        [sequelize.fn('SUM', sequelize.col('iva')), 'ivaTotal'],
        [sequelize.fn('SUM', sequelize.col('descuento')), 'descuentoTotal'],
        [sequelize.fn('SUM', sequelize.col('totalPagar')), 'totalPagarTotal'],
        [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('pago.id'))), 'numPagos']
      ],
      include: [
        {
          model: Reserva,
          as: 'reservasPago',
          attributes: [],
          include: [
            {
              model: Funcion,
              as: 'funcion',
              attributes: [],
              include: [
                {
                  model: Sala,
                  as: 'sala',
                  attributes: [],
                  include: [
                    {
                      model: Sucursal,
                      as: 'sucursal',
                      attributes: ['id', 'nombre']
                    }
                  ]
                }
              ]
            }
          ]
        }
      ],
      group: ['reservasPago.funcion.sala.sucursal.id', 'reservasPago.funcion.sala.sucursal.nombre'],
      raw: true,
      nest: true
    });

    // Mapear resultado para hacerlo más plano
    const data = resultados.map(r => ({
      subtotalTotal: parseFloat(r.subtotalTotal),
      ivaTotal: parseFloat(r.ivaTotal),
      descuentoTotal: parseFloat(r.descuentoTotal),
      totalPagarTotal: parseFloat(r.totalPagarTotal),
      numPagos: parseInt(r.numPagos),
      sucursalId: r.reservasPago.funcion.sala.sucursal.id,
      sucursalNombre: r.reservasPago.funcion.sala.sucursal.nombre
    }));

    res.json(data);

  } catch (error) {
    console.error("Error en dashboard pagosPorSucursal:", error);
    res.status(500).json({ message: "Error al obtener pagos por sucursal", error: error.message });
  }
};

// ==========================
// Ventas por Película (boletos + IVA)
// ==========================
exports.ventasPorPelicula = async (req, res) => {
  try {
    const { fn, col } = require('sequelize');
    const { peliculas, reservas, funciones } = require("../models");

    const resultados = await Pago.findAll({
      attributes: [
        [fn("SUM", col("totalPagar")), "total_ventas"],
        [fn("SUM", col("iva")), "total_iva"],
      ],
      include: [
        {
          model: Reserva,
          as: "reservasPago",
          attributes: [],
          include: [
            {
              model: Funcion,
              as: "funcion",
              attributes: [],
              include: [
                {
                  model: db.peliculas, // Usar db.peliculas en lugar de solo peliculas
                  as: "pelicula",
                  attributes: ["id", "titulo"],
                },
              ],
            },
          ],
        },
      ],
      where: { estado: "confirmado" },
      group: [
        "reservasPago.funcion.pelicula.id",
        "reservasPago.funcion.pelicula.titulo",
      ],
      raw: true,
    });

    const data = resultados.map((r) => ({
      pelicula: r["reservasPago.funcion.pelicula.titulo"],
      total_ventas: parseFloat(r.total_ventas || 0),
      total_iva: parseFloat(r.total_iva || 0),
    }));

    res.json(data);
  } catch (error) {
    console.error("Error al obtener ventas por película:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==========================
// 4️⃣ Cantidad de Entradas Vendidas por Película
// ==========================
exports.entradasPorPelicula = async (req, res) => {
  try {
    const resultados = await Reserva.findAll({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('reserva.id')), 'total_entradas']
      ],
      include: [
        {
          model: Funcion,
          as: 'funcion',
          attributes: [],
          include: [
            {
              model: db.peliculas,
              as: 'pelicula',
              attributes: ['id', 'titulo']
            }
          ]
        },
        {
          model: Pago,
          as: 'pago',
          attributes: [],
          where: {
            estado: 'confirmado'
          },
          required: true
        }
      ],
      group: [
        'funcion.pelicula.id',
        'funcion.pelicula.titulo'
      ],
      raw: true
    });

    // Procesar los resultados - forma segura para raw: true
    const data = resultados.map(r => {
      // Cuando usas raw: true, los datos vienen planos con puntos
      const peliculaId = r['funcion.pelicula.id'];
      const peliculaTitulo = r['funcion.pelicula.titulo'];
      
      return {
        peliculaId: peliculaId,
        pelicula: peliculaTitulo,
        total_entradas: parseInt(r.total_entradas)
      };
    });

    // Ordenar por mayor cantidad de entradas
    data.sort((a, b) => b.total_entradas - a.total_entradas);

    res.json(data);

  } catch (error) {
    console.error("Error al obtener entradas por película:", error);
    res.status(500).json({ 
      message: "Error al obtener cantidad de entradas por película", 
      error: error.message 
    });
  }
};

// ==========================
// Total Ventas de Comida (con IVA)
// ==========================
exports.ventasComidaTotales = async (req, res) => {
  try {
    const IVA_PORCENTAJE = 0.12; // 12% de IVA
    
    // Obtener todas las ventas para calcular correctamente
    const todasVentas = await db.ventas.findAll({
      attributes: ['total', 'iva']
    });

    let totalVentasComida = 0;
    let totalIVAComida = 0;
    let totalVentasSinIVA = 0;

    // Calcular manualmente si el IVA no está guardado
    todasVentas.forEach(venta => {
      totalVentasComida += parseFloat(venta.total);
      
      if (parseFloat(venta.iva) > 0) {
        // Si ya tiene IVA guardado, usarlo
        totalIVAComida += parseFloat(venta.iva);
      } else {
        // Si no tiene IVA, calcularlo (asumiendo que el total incluye IVA)
        const ivaCalculado = venta.total * (IVA_PORCENTAJE / (1 + IVA_PORCENTAJE));
        totalIVAComida += ivaCalculado;
      }
    });

    totalVentasSinIVA = totalVentasComida - totalIVAComida;
    const totalTransacciones = await db.ventas.count();

    res.json({
      total_ventas_comida: parseFloat(totalVentasComida.toFixed(2)),
      total_iva_comida: parseFloat(totalIVAComida.toFixed(2)),
      total_sin_iva: parseFloat(totalVentasSinIVA.toFixed(2)),
      total_transacciones: totalTransacciones,
      iva_porcentaje: IVA_PORCENTAJE * 100 + '%',
      mensaje: "Ventas de comida calculadas correctamente"
    });

  } catch (error) {
    console.error("Error al obtener ventas de comida:", error);
    res.status(500).json({ 
      message: "Error al obtener ventas de comida", 
      error: error.message 
    });
  }
};

// ==========================
// Películas Más Vistas (SOLUCIÓN DEFINITIVA)
// ==========================
exports.peliculasMasVistas = async (req, res) => {
  try {
    const { limite = 10 } = req.query;

    // Consulta CORREGIDA - usando comillas dobles para columnas camelCase
    const [resultados] = await db.sequelize.query(`
      SELECT 
        p.id as "peliculaId",
        p.titulo as "pelicula",
        p.genero as "genero",
        p.duracion as "duracion",
        p."carteleraUrl" as "cartelera_url",
        p.pais as "pais",
        p.anio as "anio",
        p.calificacion as "calificacion",
        COUNT(r.id) as "total_entradas"
      FROM reservas r
      INNER JOIN pagos pg ON r."pagoId" = pg.id AND pg.estado = 'confirmado'
      INNER JOIN funciones f ON r."funcionId" = f.id
      INNER JOIN peliculas p ON f."peliculaId" = p.id
      WHERE r.estado = 'confirmado'
      GROUP BY p.id, p.titulo, p.genero, p.duracion, p."carteleraUrl", p.pais, p.anio, p.calificacion
      ORDER BY "total_entradas" DESC
      LIMIT ${parseInt(limite)}
    `);

    const data = resultados.map((p, index) => ({
      ranking: index + 1,
      pelicula_id: p.peliculaId,
      pelicula: p.pelicula,
      genero: p.genero,
      duracion: p.duracion,
      cartelera_url: p.cartelera_url,
      pais: p.pais,
      año: p.anio,
      calificacion: p.calificacion,
      total_entradas: parseInt(p.total_entradas)
    }));

    res.json({
      peliculas: data,
      total_peliculas: resultados.length,
      fecha_consulta: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error al obtener películas más vistas:", error);
    res.status(500).json({ 
      message: "Error al obtener películas más vistas", 
      error: error.message 
    });
  }
};

// ==========================
// Diagnóstico - Estructura de la tabla Películas
// ==========================
exports.diagnosticoPeliculas = async (req, res) => {
  try {
    // Consulta para ver la estructura de la tabla
    const [columnas] = await db.sequelize.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'peliculas' 
      ORDER BY ordinal_position
    `);

    // Ver algunos registros de ejemplo
    const [ejemplos] = await db.sequelize.query(`
      SELECT * FROM peliculas LIMIT 3
    `);

    res.json({
      estructura_tabla: columnas,
      registros_ejemplo: ejemplos,
      mensaje: "Diagnóstico de la tabla películas"
    });

  } catch (error) {
    console.error("Error en diagnóstico:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==========================
// Función auxiliar para determinar franja horaria
// ==========================
function obtenerFranjaHoraria(hora) {
  const [horas] = hora.split(':').map(Number);
  if (horas >= 9 && horas < 13) return 'Mañana';
  if (horas >= 13 && horas < 18) return 'Tarde';
  if (horas >= 18 && horas < 23) return 'Noche';
  return 'Madrugada';
}

// ==========================
// Horarios con Mayor Demanda (General) - CORREGIDO
// ==========================
exports.horariosMasDemandados = async (req, res) => {
  try {
    const { limite = 20, periodo = 'todos' } = req.query;
    
    let fechaFiltro = '';
    
    // Filtro por período
    if (periodo === 'mes') {
      const inicioMes = new Date();
      inicioMes.setDate(1);
      inicioMes.setHours(0, 0, 0, 0);
      fechaFiltro = `AND f.fecha >= '${inicioMes.toISOString().split('T')[0]}'`;
    } else if (periodo === 'semana') {
      const inicioSemana = new Date();
      inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
      inicioSemana.setHours(0, 0, 0, 0);
      fechaFiltro = `AND f.fecha >= '${inicioSemana.toISOString().split('T')[0]}'`;
    }

    const [resultados] = await db.sequelize.query(`
      SELECT 
        TO_CHAR(f.hora, 'HH24:MI') as "hora",
        EXTRACT(DOW FROM f.fecha) as "dia_semana_num",
        TO_CHAR(f.fecha, 'Day') as "dia_semana",
        COUNT(r.id) as "total_entradas",
        COUNT(DISTINCT f.id) as "total_funciones",
        COUNT(DISTINCT p.id) as "total_peliculas",
        ROUND(AVG(EXTRACT(HOUR FROM f.hora)), 1) as "hora_promedio"
      FROM funciones f
      INNER JOIN reservas r ON f.id = r."funcionId"
      INNER JOIN pagos pg ON r."pagoId" = pg.id AND pg.estado = 'confirmado'
      INNER JOIN peliculas p ON f."peliculaId" = p.id
      WHERE r.estado = 'confirmado'
      ${fechaFiltro}
      GROUP BY f.hora, EXTRACT(DOW FROM f.fecha), TO_CHAR(f.fecha, 'Day')
      ORDER BY "total_entradas" DESC
      LIMIT ${parseInt(limite)}
    `);

    // Mapear números de día a nombres en español
    const diasSemana = {
      0: 'Domingo', 1: 'Lunes', 2: 'Martes', 3: 'Miércoles',
      4: 'Jueves', 5: 'Viernes', 6: 'Sábado'
    };

    const data = resultados.map((h, index) => ({
      ranking: index + 1,
      hora: h.hora,
      dia_semana: diasSemana[h.dia_semana_num] || h.dia_semana,
      dia_semana_num: parseInt(h.dia_semana_num),
      total_entradas: parseInt(h.total_entradas),
      total_funciones: parseInt(h.total_funciones),
      total_peliculas: parseInt(h.total_peliculas),
      hora_promedio: parseFloat(h.hora_promedio),
      franja_horaria: obtenerFranjaHoraria(h.hora)
    }));

    res.json({
      periodo: periodo,
      total_horarios: resultados.length,
      horarios: data,
      fecha_consulta: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error al obtener horarios más demandados:", error);
    res.status(500).json({ 
      message: "Error al obtener horarios más demandados", 
      error: error.message 
    });
  }
};

// ==========================
// Efectividad General de Promociones - CORREGIDO
// ==========================
exports.efectividadPromociones = async (req, res) => {
  try {
    const { periodo = 'todos' } = req.query;
    
    let fechaFiltro = '';
    
    // Filtro por período
    if (periodo === 'mes') {
      const inicioMes = new Date();
      inicioMes.setDate(1);
      inicioMes.setHours(0, 0, 0, 0);
      fechaFiltro = `AND f.fecha >= '${inicioMes.toISOString().split('T')[0]}'`;
    } else if (periodo === 'semana') {
      const inicioSemana = new Date();
      inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
      inicioSemana.setHours(0, 0, 0, 0);
      fechaFiltro = `AND f.fecha >= '${inicioSemana.toISOString().split('T')[0]}'`;
    }

    const [resultados] = await db.sequelize.query(`
      SELECT 
        -- Estadísticas generales
        COUNT(pg.id) as total_pagos,
        COUNT(pg.id) FILTER (WHERE pg."promocionId" IS NOT NULL) as pagos_con_promocion,
        COUNT(pg.id) FILTER (WHERE pg."promocionId" IS NULL) as pagos_sin_promocion,
        
        -- Métricas financieras
        COALESCE(SUM(pg."totalPagar"), 0) as ingresos_totales,
        COALESCE(SUM(pg."totalPagar") FILTER (WHERE pg."promocionId" IS NOT NULL), 0) as ingresos_con_promocion,
        COALESCE(SUM(pg."totalPagar") FILTER (WHERE pg."promocionId" IS NULL), 0) as ingresos_sin_promocion,
        
        -- Descuentos aplicados
        COALESCE(SUM(pg.descuento), 0) as total_descuentos,
        COALESCE(SUM(pg.subtotal), 0) as subtotal_total,
        
        -- Promedios - CORREGIDO: usar CAST para redondear
        CAST(AVG(pg."totalPagar") FILTER (WHERE pg."promocionId" IS NOT NULL) AS NUMERIC(10,2)) as promedio_con_promocion,
        CAST(AVG(pg."totalPagar") FILTER (WHERE pg."promocionId" IS NULL) AS NUMERIC(10,2)) as promedio_sin_promocion,
        
        -- Tasa de uso - CORREGIDO: usar CAST
        CAST((COUNT(pg.id) FILTER (WHERE pg."promocionId" IS NOT NULL) * 100.0 / NULLIF(COUNT(pg.id), 0)) AS NUMERIC(10,2)) as tasa_uso_porcentaje
        
      FROM pagos pg
      INNER JOIN reservas r ON pg.id = r."pagoId"
      INNER JOIN funciones f ON r."funcionId" = f.id
      WHERE pg.estado = 'confirmado'
        AND r.estado = 'confirmado'
        ${fechaFiltro}
    `);

    const data = resultados[0];
    const totalPagos = parseInt(data.total_pagos);
    const pagosConPromocion = parseInt(data.pagos_con_promocion);
    const tasaUso = parseFloat(data.tasa_uso_porcentaje);

    res.json({
      periodo: periodo,
      metricas_generales: {
        total_pagos: totalPagos,
        pagos_con_promocion: pagosConPromocion,
        pagos_sin_promocion: parseInt(data.pagos_sin_promocion),
        tasa_uso_promociones: tasaUso + '%',
        efectividad_global: tasaUso > 20 ? 'Alta' : tasaUso > 10 ? 'Media' : 'Baja'
      },
      metricas_financieras: {
        ingresos_totales: parseFloat(data.ingresos_totales),
        ingresos_con_promocion: parseFloat(data.ingresos_con_promocion),
        ingresos_sin_promocion: parseFloat(data.ingresos_sin_promocion),
        total_descuentos_aplicados: parseFloat(data.total_descuentos),
        subtotal_sin_descuentos: parseFloat(data.subtotal_total),
        promedio_ticket_con_promocion: parseFloat(data.promedio_con_promocion),
        promedio_ticket_sin_promocion: parseFloat(data.promedio_sin_promocion)
      },
      analisis: {
        porcentaje_ingresos_con_promocion: parseFloat(data.ingresos_totales) > 0 ? 
          ((parseFloat(data.ingresos_con_promocion) / parseFloat(data.ingresos_totales)) * 100).toFixed(1) + '%' : '0%',
        ahorro_promedio_por_ticket: (parseFloat(data.promedio_sin_promocion) - parseFloat(data.promedio_con_promocion)).toFixed(2),
        roi_promociones: parseFloat(data.ingresos_con_promocion) > 0 ? 
          (parseFloat(data.ingresos_con_promocion) / parseFloat(data.total_descuentos)).toFixed(2) : 0
      }
    });

  } catch (error) {
    console.error("Error al obtener efectividad de promociones:", error);
    res.status(500).json({ 
      message: "Error al obtener efectividad de promociones", 
      error: error.message 
    });
  }
};