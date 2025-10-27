const db = require("../models");
const Pago = db.pagos;
const Reserva = db.reservas;
const Funcion = db.funciones;
const Sala = db.salas;
const Sucursal = db.sucursales;
const sequelize = db.Sequelize;

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
