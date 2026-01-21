import api from '@/axios'

export async function fetchRecipes() {
  try {
    const response = await api.get('/Recipes')
    return response.data
  } catch (error) {
    console.warn('⚠️ Backend hiba, fallback mock receptek betöltése...')
    console.error(error)

    // Ha backend 500-at dob, helyi mintareceptek
    if (error.response && error.response.status === 500) {
      return [
        {
          id: 1,
          title: 'Palacsinta',
          description: 'Egyszerű, klasszikus palacsinta recept',
          ingredients: ['Liszt', 'Tojás', 'Tej', 'Cukor'],
          authorEmail: 'minta@izkalauz.hu',
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          title: 'Rántotta',
          description: 'Gyors reggeli recept',
          ingredients: ['Tojás', 'Só', 'Olaj'],
          authorEmail: 'chef@izkalauz.hu',
          createdAt: new Date().toISOString(),
        }
      ]
    }

    // Ha más hiba történt
    throw error
  }
}
