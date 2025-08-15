import { 
  collection as firebaseCollection, 
  doc as firebaseDoc, 
  addDoc as firebaseAddDoc,
  getDocs as firebaseGetDocs,
  updateDoc as firebaseUpdateDoc,
  deleteDoc as firebaseDeleteDoc,
  query as firebaseQuery,
  where as firebaseWhere,
  orderBy as firebaseOrderBy
} from 'firebase/firestore'
import { db } from './firebase'

// 사용자별 todos 컬렉션 참조 생성
export const getUserTodosCollection = (userId) => {
  if (!db || !userId) return null
  return firebaseCollection(db, 'users', userId, 'todos')
}

// 사용자별 document 참조 생성
export const getUserTodoDoc = (userId, todoId) => {
  if (!db || !userId || !todoId) return null
  return firebaseDoc(db, 'users', userId, 'todos', todoId)
}

// 사용자별 할 일 추가
export const addUserTodo = async (userId, data) => {
  if (!db || !userId) {
    throw new Error('Database not initialized or user not authenticated')
  }

  const userTodosCollection = getUserTodosCollection(userId)
  return await firebaseAddDoc(userTodosCollection, {
    ...data,
    userId,
    createdAt: new Date(),
    updatedAt: new Date()
  })
}

// 사용자별 할 일 목록 조회
export const getUserTodos = async (userId, conditions = []) => {
  if (!db || !userId) {
    throw new Error('Database not initialized or user not authenticated')
  }

  const userTodosCollection = getUserTodosCollection(userId)
  
  if (conditions.length === 0) {
    const querySnapshot = await firebaseGetDocs(userTodosCollection)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  }

  const q = firebaseQuery(userTodosCollection, ...conditions)
  const querySnapshot = await firebaseGetDocs(q)
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
}

// 사용자별 할 일 업데이트
export const updateUserTodo = async (userId, todoId, updates) => {
  if (!db || !userId || !todoId) {
    throw new Error('Database not initialized or user not authenticated')
  }

  const todoDoc = getUserTodoDoc(userId, todoId)
  return await firebaseUpdateDoc(todoDoc, {
    ...updates,
    updatedAt: new Date()
  })
}

// 사용자별 할 일 삭제
export const deleteUserTodo = async (userId, todoId) => {
  if (!db || !userId || !todoId) {
    throw new Error('Database not initialized or user not authenticated')
  }

  const todoDoc = getUserTodoDoc(userId, todoId)
  return await firebaseDeleteDoc(todoDoc)
}

// Helper functions for queries
export const createWhereCondition = (field, operator, value) => {
  return firebaseWhere(field, operator, value)
}

export const createOrderByCondition = (field, direction = 'asc') => {
  return firebaseOrderBy(field, direction)
}