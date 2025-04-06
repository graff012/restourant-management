import pool from '../config/db.js';
import CustomError from '../utils/custom.error.js';

const createMenuItem = async (req, res, next) => {
  try {
    const {
      name,
      description,
      price,
      categoryId,
      imageUrl,
      available = true,
    } = req.body;
    if (!name || !price || !categoryId) {
      throw new CustomError('Name, price, and categoryId are required', 400);
    }
    const query = `
      INSERT INTO menu_items (name, description, price, category_id, image_url, available)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const { rows } = await pool.query(query, [
      name,
      description,
      price,
      categoryId,
      imageUrl,
      available,
    ]);
    res.status(201).json({
      status: 'success',
      message: 'Menu item created successfully',
      data: rows[0],
    });
  } catch (error) {
    next(error);
  }
};

const getAllMenuItems = async (req, res, next) => {
  try {
    const { categoryId, available } = req.query;
    let query = `
      SELECT mi.*, c.id AS category_id, c.name AS category_name
      FROM menu_items mi
      LEFT JOIN categories c ON mi.category_id = c.id
    `;
    const values = [];
    let conditions = [];

    if (categoryId) {
      conditions.push(`mi.category_id = $${conditions.length + 1}`);
      values.push(categoryId);
    }
    if (available !== undefined) {
      conditions.push(`mi.available = $${conditions.length + 1}`);
      values.push(available === 'true');
    }
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    const { rows } = await pool.query(query, values);
    res.status(200).json({
      status: 'success',
      data: rows.map((item) => ({
        ...item,
        category: { id: item.category_id, name: item.category_name },
      })),
    });
  } catch (error) {
    next(error);
  }
};

export { createMenuItem, getAllMenuItems };
