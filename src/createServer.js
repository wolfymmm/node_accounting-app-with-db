'use strict';

const express = require('express');
const { Op } = require('sequelize');
const {
  models: { User, Expense },
} = require('./models/models');

function createServer() {
  const app = express();

  app.use(express.json());

  // --- USERS ---
  app.get('/users', async (req, res) => {
    res.json(await User.findAll());
  });

  app.post('/users', async (req, res) => {
    const { name } = req.body;

    if (!name) {
      return res.sendStatus(400);
    }

    const newUser = await User.create({ name });

    res.status(201).json(newUser);
  });

  app.get('/users/:id', async (req, res) => {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.sendStatus(404);
    }
    res.json(user);
  });

  app.patch('/users/:id', async (req, res) => {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.sendStatus(404);
    }

    const { name } = req.body;

    if (!name) {
      return res.sendStatus(400);
    }

    await user.update({ name });
    res.json(user.get({ plain: true }));
  });

  app.delete('/users/:id', async (req, res) => {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.sendStatus(404);
    }
    await user.destroy();
    res.sendStatus(204);
  });

  // --- EXPENSES ---
  app.get('/expenses', async (req, res) => {
    const { userId, categories, category, from, to } = req.query;
    const where = {};

    if (userId) {
      where.userId = Number(userId);
    }

    const rawCategories = categories || category;

    if (rawCategories) {
      where.category = {
        [Op.in]: rawCategories.split(',').map((c) => c.trim()),
      };
    }

    if (from || to) {
      where.spentAt = {};

      if (from) {
        where.spentAt[Op.gte] = from;
      }

      if (to) {
        where.spentAt[Op.lte] = to;
      }
    }

    const expenses = await Expense.findAll({ where });

    res.json(expenses);
  });

  app.post('/expenses', async (req, res) => {
    const { userId, amount, category, title, spentAt } = req.body;

    if (userId === undefined || amount === undefined || !title || !spentAt) {
      return res.sendStatus(400);
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.sendStatus(400);
    }

    const newExpense = await Expense.create({
      userId: Number(userId),
      amount: Number(amount),
      title,
      spentAt,
      category: category || 'Other',
      note: req.body.note || null,
    });

    res.status(201).json(newExpense);
  });

  app.get('/expenses/:id', async (req, res) => {
    const expense = await Expense.findByPk(req.params.id);

    if (!expense) {
      return res.sendStatus(404);
    }
    res.json(expense);
  });

  app.patch('/expenses/:id', async (req, res) => {
    const expense = await Expense.findByPk(req.params.id);

    if (!expense) {
      return res.sendStatus(404);
    }

    if (req.body.userId !== undefined) {
      const user = await User.findByPk(req.body.userId);

      if (!user) {
        return res.sendStatus(400);
      }
    }

    await expense.update(req.body);
    res.json(await expense.reload());
  });

  app.delete('/expenses/:id', async (req, res) => {
    const expense = await Expense.findByPk(req.params.id);

    if (!expense) {
      return res.sendStatus(404);
    }
    await expense.destroy();
    res.sendStatus(204);
  });

  return app;
}

module.exports = { createServer };
