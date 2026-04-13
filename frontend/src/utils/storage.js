// ======================
// 🔥 HELPER
// ======================

const getItem = (key) => {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

const setItem = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value || []))
}



// ======================
// 🔥 USERS
// ======================

export const getUsers = () => getItem("users")

export const saveUsers = (users) => setItem("users", users)

export const addUser = (user) => {
  const users = getUsers()
  users.push(user)
  saveUsers(users)
}

export const updateUser = (index, newData) => {
  const users = getUsers()

  if (users[index]) {
    users[index] = {
      ...users[index],
      ...newData,
    }
    saveUsers(users)
  }
}

export const deleteUser = (index) => {
  const users = getUsers()
  users.splice(index, 1)
  saveUsers(users)
}



// ======================
// 🔥 DIVISI
// ======================

export const getDivisi = () => getItem("divisi")

export const saveDivisi = (divisi) => setItem("divisi", divisi)

export const addDivisi = (newDivisi) => {
  const data = getDivisi()
  data.push(newDivisi)
  saveDivisi(data)
}

export const deleteDivisi = (index) => {
  const data = getDivisi()
  data.splice(index, 1)
  saveDivisi(data)
}



// ======================
// 🔥 MATERI
// ======================

export const getMateri = () => getItem("materi")

export const saveMateri = (materi) => setItem("materi", materi)

export const addMateri = (newMateri) => {
  const data = getMateri()
  data.push(newMateri)
  saveMateri(data)
}

export const updateMateri = (id, updatedData) => {
  const data = getMateri().map(item =>
    item.id === id
      ? { ...item, ...updatedData }
      : item
  )
  saveMateri(data)
}

export const deleteMateri = (id) => {
  const data = getMateri().filter(item => item.id !== id)
  saveMateri(data)
}



// ======================
// 🔥 QUIZ
// ======================

export const getQuiz = () => getItem("quiz")

export const saveQuiz = (quiz) => setItem("quiz", quiz)

export const addQuiz = (newQuiz) => {
  const data = getQuiz()
  data.push(newQuiz)
  saveQuiz(data)
}

export const updateQuiz = (id, updatedQuiz) => {
  const data = getQuiz().map(q =>
    q.id === id
      ? { ...q, ...updatedQuiz }
      : q
  )
  saveQuiz(data)
}

export const deleteQuiz = (id) => {
  const data = getQuiz().filter(q => q.id !== id)
  saveQuiz(data)
}



// ======================
// 🔥 QUIZ RESULT (STATISTIK)
// ======================

export const getQuizResult = () => getItem("quiz_result")

export const saveQuizResult = (data) => setItem("quiz_result", data)



// ======================
// 🔥 OPTIONAL (UTILS)
// ======================

// RESET SEMUA DATA
export const resetStorage = () => {
  localStorage.removeItem("users")
  localStorage.removeItem("divisi")
  localStorage.removeItem("materi")
  localStorage.removeItem("quiz")
  localStorage.removeItem("quiz_result")
}

// CEK KOSONG
export const isEmpty = (key) => {
  const data = getItem(key)
  return !data || data.length === 0
}