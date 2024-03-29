import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'

import { userIsAuthenticated, getPayload } from '../helper/authHelper'

import Nav from '../Nav'
import recipePlaceholder from '../../assets/placeholder_recipe_pic.png'

const MyRecipes = () => {

  const navigate = useNavigate()

  const [currentUser, setCurrentUser] = useState({})

  const [SearchInput, setSearchInput] = useState('')
  const [myAndFavRecipes, setMyAndFavRecipes] = useState([])
  const [filteredRecipes, setFilteredRecipes] = useState([])
  //const [searchedRecipes, setSearchedRecipes] = useState([])
  const [recipesToDisplay, setRecipesToDisplay] = useState([])
  const [errorMessage, setErrorMessage] = useState('')

  const [currentFilter, setCurrentFilter] = useState('myRecipes')


  useEffect(() => {
    !userIsAuthenticated() && navigate('/login')
    const getCurrentUser = async () => {
      try {
        const payload = getPayload()
        const { data } = await axios.get(`/api/profile/${payload.sub}`)
        setCurrentUser(data)
        setRecipesToDisplay([...data.yourRecipes])
        setMyAndFavRecipes([...data.yourRecipes, ...data.favRecipes])
        if (data.yourRecipes.length === 0) {
          setErrorMessage('Here is where your recipes will display! Click ADD RECIPE to get started!')
        }
      } catch (err) {
        console.log(err)
      }
    }
    getCurrentUser()
  }, [])

  const handleTextInputChange = (e) => {
    setSearchInput(e.target.value)
    setRecipesToDisplay(filteredRecipes)
    setErrorMessage('')
  }

  const handleFilter = (e) => {
    if (e.target.value === 'myRecipes') {
      setFilteredRecipes(currentUser.yourRecipes)
      setCurrentFilter('myRecipes')
    }
    if (e.target.value === 'favRecipes') {
      setFilteredRecipes(currentUser.favRecipes)
      setCurrentFilter('favRecipes')
    }
    if (e.target.value === 'allRecipes') {
      setFilteredRecipes(myAndFavRecipes)
      setCurrentFilter('allRecipes')
    }
    setErrorMessage('')
  }

  useEffect(() => {
    runSearch()
  }, [filteredRecipes])


  const runSearch = () => {
    console.log(filteredRecipes)
    console.log(SearchInput)
    if (SearchInput === '' || SearchInput === null) {
      setRecipesToDisplay(filteredRecipes)
    } else {
      const foundRecipes = []
      for (let i = 0; i < filteredRecipes.length; i++) {
        if (filteredRecipes[i].title.toLowerCase().includes(SearchInput.toLowerCase()) || filteredRecipes[i].tags.some(tag => tag.toLowerCase().includes(SearchInput.toLowerCase())) || filteredRecipes[i].ingredients.some(ing => ing.ingredient.toLowerCase().includes(SearchInput.toLowerCase()))) {
          foundRecipes.push(filteredRecipes[i])
        }
      }
      console.log('here', foundRecipes)
      setRecipesToDisplay([...foundRecipes])
      if (foundRecipes.length === 0) {
        setRecipesToDisplay([])
        setErrorMessage('sorry, we could not find anything that matches that')
      }
    }
  }


  return (
    <section className='my-recipes-page'>
      <Nav />
      <div className='my-recipes-title-and-button'>
        <h3>My Recipes</h3>
        <Link to='/addrecipe'><button className='green-branded-button' >ADD RECIPE</button></Link>
      </div>
      <div className='search-bar-container'>
        <input type='text' placeholder='Search...' onChange={handleTextInputChange}></input>
        <button className='grey-branded-button' onClick={runSearch}>Go</button>
      </div>

      <div className='profile-main-section-header'>
        <div className='filter-options'>
          <button onClick={handleFilter} value='myRecipes' className='left-button' id={currentFilter === 'myRecipes' && 'bold'}>My Recipes</button> {/**************************** add on click to filter display array- also fade or highlight selected ********************/}
          <button onClick={handleFilter} value='favRecipes' className='middle-button' id={currentFilter === 'favRecipes' && 'bold'}>My Favourites</button>
          <button onClick={handleFilter} value='allRecipes' className='right-button' id={currentFilter === 'allRecipes' && 'bold'}>All</button>
        </div>
      </div>
      <p className='error-message'>{errorMessage}</p>
      <div className='recipe-card-dislay-container'>
        {recipesToDisplay?.map((recipe, index) => {
          return (
            <Link key={index} to={`/recipe/${recipe._id}`}>
              <div className='recipe-card'>
                <div className='recipe-image-container'>
                  {recipe.image === 'imageurl' ?
                    <img src={recipePlaceholder} alt='placeholder recipe' />
                    :
                    <img src={recipe.image} alt={recipe.title} />}
                </div>
                <div className='text-container'>
                  <h3>{recipe.title}</h3>
                  {recipe.avgRating === 'Not rated yet' ?
                    <p>Not Rated Yet</p>
                    :
                    recipe.avgRating >= 4.5 ?
                      <p>⭐️⭐️⭐️⭐️⭐️</p>
                      :
                      recipe.avgRating >= 3.5 ?
                        <p>⭐️⭐️⭐️⭐️</p>
                        :
                        recipe.avgRating >= 2.5 ?
                          <p>⭐️⭐️⭐️</p>
                          :
                          recipe.avgRating >= 1.5 ?
                            <p>⭐️⭐️</p>
                            :
                            <p>⭐️</p>
                  }
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

export default MyRecipes