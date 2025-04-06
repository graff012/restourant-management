import pool from '../config/db.js';
import CustomError from '../utils/custom.error.js';

const createOrder = async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { tableNumber, customerName, items } = req.body;
    if (!tableNumber || !items || !Array.isArray(items) || items.length === 0) {
      throw new CustomError('Table number and items are required', 400);
    }

    let totalAmount = 0;
    for (const item of items) {
      const { menuItemId, quantity } = item;
      const { rows } = await client.query(
        'SELECT price FROM menu_items WHERE id = $1',
        [menuItemId]
      );
      if (!rows[0]) {
        throw new CustomError(`Menu item with id ${menuItemId} not found`, 404);
      }
      totalAmount += rows[0].price * quantity;
    }

    const orderQuery = `
      INSERT INTO orders (table_number, customer_name, waiter_id, total_amount)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const waiterId = req.user.id;
    const { rows: orderRows } = await client.query(orderQuery, [
      tableNumber,
      customerName,
      waiterId,
      totalAmount,
    ]);
    const orderId = orderRows[0].id;

    for (const item of items) {
      const { menuItemId, quantity, notes } = item;
      const { rows } = await client.query(
        'SELECT price FROM menu_items WHERE id = $1',
        [menuItemId]
      );
      const price = rows[0].price;
      const orderItemQuery = `
        INSERT INTO order_items (order_id, menu_item_id, quantity, price, notes)
        VALUES ($1, $2, $3, $4, $5)
      `;
      await client.query(orderItemQuery, [
        orderId,
        menuItemId,
        quantity,
        price,
        notes,
      ]);
    }

    await client.query('COMMIT');
    res.status(201).json({
      status: 'success',
      message: 'Order created successfully',
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['new', 'preparing', 'ready', 'served', 'paid'];
    if (!status || !validStatuses.includes(status)) {
      throw new CustomError('Invalid status', 400);
    }
    const query = `
      UPDATE orders
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const { rows } = await pool.query(query, [status, id]);
    if (!rows[0]) {
      throw new CustomError('Order not found', 404);
    }
    res.status(200).json({
      status: 'success',
      message: 'Order status updated successfully',
      data: rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export { createOrder, updateOrderStatus };
