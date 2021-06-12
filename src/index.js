const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');
const { request } = require('express');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  // Complete aqui
  const { username } = request.headers

  const user = users.find(user => user.username === username)
  if (!user) {
    return request.status(404).json({ error: 'User not found'})
  }

  request.username = username

  return next()
}

function getUser(username) {
  return users.find(user => user.username === username)
}

function getTodo(user, todoId) {
  return user.todos.find(todo => todo.id === todoId)
}

const STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  NOT_FOUND: 404,
  BAD_REQUEST: 400
}

const ERROR = {
  TODO: {
    NOT_FOUND: { error: 'Todo not found!' }
  },
  USER: {
    ALREADY_EXISTS: { error: 'Username already exists' },
    NOT_FOUND: { error: 'User not found!' }
  }
}

/*
{ 
	id: 'uuid', // precisa ser um uuid
	name: 'Danilo Vieira', 
	username: 'danilo', 
	todos: []
}
*/
app.post('/users', (request, response) => {
  const { name, username } = request.body

  const duplicate = users.some(user => user.username === username)
  if (duplicate) {
    return response.status(STATUS.BAD_REQUEST)
                   .json(ERROR.USER.ALREADY_EXISTS)
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user)

  return response.status(STATUS.CREATED).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const { username } = request
  
  const todos = getUser(username).todos

  return response.status(STATUS.OK).json(todos)
});

/*
{ 
	id: 'uuid', // precisa ser um uuid
	title: 'Nome da tarefa',
	done: false, 
	deadline: '2021-02-27T00:00:00.000Z', 
	created_at: '2021-02-22T00:00:00.000Z'
}
*/
app.post('/todos', checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const { title, deadline } = request.body
  const user = getUser(request.username)

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo)

  return response.status(STATUS.CREATED).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const { title, deadline } = request.body
  const user = getUser(request.username)

  const todo = user.todos.find(todo => todo.id === request.params.id)
  if (!todo) {
    return response.status(STATUS.NOT_FOUND).json(ERROR.TODO.NOT_FOUND)
  }

  todo.title = title
  todo.deadline = deadline

  return response.status(STATUS.OK).json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const user = getUser(request.username)

  const todo = user.todos.find(todo => todo.id === request.params.id)
  if (!todo) {
    return response.status(STATUS.NOT_FOUND).json(ERROR.TODO.NOT_FOUND)
  }

  todo.done = true

  return response.status(STATUS.OK).json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const user = getUser(request.username)

  const todo = getTodo(user, request.params.id)
  if (!todo) {
    return response.status(STATUS.NOT_FOUND).json(ERROR.TODO.NOT_FOUND)
  }

  user.todos.splice(user.todos.indexOf(todo), 1)

  return response.status(STATUS.NO_CONTENT).send()
});

module.exports = app;