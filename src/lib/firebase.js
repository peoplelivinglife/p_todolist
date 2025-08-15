import { initializeApp } from 'firebase/app'
import { 
  getFirestore,
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
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// Firebase 초기화 (환경변수가 있을 때만)
let app = null
export let db = null
export let auth = null
export let googleProvider = null

console.log('Environment variables:', {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? 'exists' : 'missing',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID
})

if (firebaseConfig.apiKey && firebaseConfig.apiKey !== 'your_api_key_here') {
  try {
    app = initializeApp(firebaseConfig)
    db = getFirestore(app)
    auth = getAuth(app)
    googleProvider = new GoogleAuthProvider()
    console.log('✅ Firebase initialized successfully:', {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain,
      hasApiKey: !!firebaseConfig.apiKey,
      dbConnected: !!db,
      authConnected: !!auth
    })
  } catch (error) {
    console.error('❌ Firebase initialization error:', error)
  }
} else {
  console.log('Firebase running in mock mode - add environment variables for real Firebase')
  console.log('Current config:', firebaseConfig)
}

// Mock 데이터 (초기에는 빈 배열로 시작)
let mockTodos = []

// Firebase 함수들 (실제 Firebase 또는 Mock)
export const addDoc = async (collectionRef, data) => {
  if (db) {
    // 실제 Firebase 사용
    return await firebaseAddDoc(collectionRef, data)
  } else {
    // Mock 구현
    console.log('Mock addDoc:', collectionRef, data)
    const newItem = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date()
    }
    mockTodos.push(newItem)
    return { id: newItem.id }
  }
}

export const getDocs = async (queryObj) => {
  if (db) {
    // 실제 Firebase 사용
    return await firebaseGetDocs(queryObj)
  } else {
    // Mock 구현
    console.log('Mock getDocs:', queryObj)
    
    let filteredItems = [...mockTodos]
    
    // 쿼리 조건 적용
    if (queryObj && queryObj.conditions && Array.isArray(queryObj.conditions)) {
      queryObj.conditions.forEach(condition => {
        console.log('Processing condition:', condition)
        if (condition.field === 'date' && condition.operator === '==' && condition.value === null) {
          // 백로그: date가 null인 항목
          filteredItems = filteredItems.filter(todo => todo.date === null)
        } else if (condition.field === 'date' && condition.operator === '==' && condition.value) {
          // 특정 날짜: date가 해당 값인 항목
          filteredItems = filteredItems.filter(todo => todo.date === condition.value)
        } else if (condition.field === 'date' && condition.operator === '!=') {
          // date가 특정 값이 아닌 항목
          if (condition.value === null) {
            // date가 null이 아닌 항목 (날짜가 배정된 항목)
            filteredItems = filteredItems.filter(todo => todo.date !== null)
          } else {
            // date가 특정 값이 아닌 항목
            filteredItems = filteredItems.filter(todo => todo.date !== condition.value)
          }
        }
      })
    }
    
    console.log('Filtered items:', filteredItems.length)
    
    // 정렬 (createdAt desc가 기본)
    filteredItems.sort((a, b) => {
      if (a.order && b.order) return a.order - b.order
      return new Date(b.createdAt) - new Date(a.createdAt)
    })
    
    return {
      docs: filteredItems.map(item => ({
        id: item.id,
        data: () => item
      }))
    }
  }
}

export const updateDoc = async (docRef, updates) => {
  if (db) {
    // 실제 Firebase 사용
    return await firebaseUpdateDoc(docRef, updates)
  } else {
    // Mock 구현
    console.log('Mock updateDoc called with:', { docRef, updates })
    console.log('Current mockTodos before update:', mockTodos)
    
    const todoIndex = mockTodos.findIndex(todo => todo.id === docRef)
    console.log('Found todo at index:', todoIndex)
    
    if (todoIndex !== -1) {
      const oldTodo = { ...mockTodos[todoIndex] }
      mockTodos[todoIndex] = {
        ...mockTodos[todoIndex],
        ...updates,
        updatedAt: new Date()
      }
      
      console.log('Updated todo:', { 
        old: oldTodo, 
        new: mockTodos[todoIndex] 
      })
      
      // 날짜가 배정되면 백로그에서 제거 (date가 null이 아니게 됨)
      if (updates.date) {
        console.log('Item moved to scheduled with date:', updates.date)
      }
    } else {
      console.log('Todo not found with id:', docRef)
    }
    
    console.log('Current mockTodos after update:', mockTodos)
    return true
  }
}

export const doc = (database, collectionName, id) => {
  if (db) {
    // 실제 Firebase doc 함수 사용
    return firebaseDoc(database, collectionName, id)
  } else {
    // Mock에서는 ID만 반환
    return id
  }
}

export const collection = (database, name) => {
  if (db) {
    // 실제 Firebase collection 함수 사용
    return firebaseCollection(database, name)
  } else {
    // Mock에서는 컬렉션 이름만 반환
    return name
  }
}

export const query = (collectionRef, ...conditions) => {
  if (db) {
    // 실제 Firebase query 함수 사용
    return firebaseQuery(collectionRef, ...conditions)
  } else {
    // Mock 쿼리 객체
    console.log('Mock query created with conditions:', conditions)
    return { collection: collectionRef, conditions: conditions }
  }
}

export const where = (field, operator, value) => {
  if (db) {
    // 실제 Firebase where 함수 사용
    return firebaseWhere(field, operator, value)
  } else {
    // Mock where 조건
    return { field, operator, value }
  }
}

export const orderBy = (field, direction = 'asc') => {
  if (db) {
    // 실제 Firebase orderBy 함수 사용
    return firebaseOrderBy(field, direction)
  } else {
    // Mock orderBy 조건
    return { field, direction }
  }
}

export const deleteDoc = async (docRef) => {
  if (db) {
    // 실제 Firebase deleteDoc 함수 사용
    return await firebaseDeleteDoc(docRef)
  } else {
    // Mock 구현
    console.log('Mock deleteDoc called with:', docRef)
    const todoIndex = mockTodos.findIndex(todo => todo.id === docRef)
    
    if (todoIndex !== -1) {
      const deletedTodo = mockTodos.splice(todoIndex, 1)[0]
      console.log('Deleted todo:', deletedTodo)
      return true
    } else {
      console.log('Todo not found for deletion:', docRef)
      throw new Error('Document not found')
    }
  }
}