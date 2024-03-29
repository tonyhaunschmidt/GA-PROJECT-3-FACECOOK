import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

import Calendar from 'react-calendar'

import { getPayload, getTokenFromLocalStorage } from '../helper/authHelper'

import Nav from '../Nav'
import profilePlaceholder from '../../assets/placeholder_profile_pic.png'
import recipePlaceholder from '../../assets/placeholder_recipe_pic.png'

const ProfileOther = () => {

  const navigate = useNavigate()

  const { id } = useParams()
  const [currentUser, setCurrentUser] = useState({})
  const [profile, setProfile] = useState({})

  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [recentlyAdded, setRecentlyAdded] = useState([])

  const [recipesToDisplay, setRecipesToDisplay] = useState([])
  const [myAndFavRecipes, setMyAndFavRecipes] = useState([])
  const [isUserFollowing, setIsUserFollowing] = useState(false)

  const [showPopUp, setShowPopUp] = useState(false)
  const [followToDisplay, setFollowToDisplay] = useState([])
  const [followerCount, setFollowerCount] = useState(0)
  const [followers, setFollowers] = useState([])
  const [following, setFollowing] = useState([])


  const [currentFilter, setCurrentFilter] = useState('userRecipes')
  const [currentFollowFilter, setCurrentFollowFilter] = useState('followers')

  const [calendarPopup, setCalendarPopup] = useState(false)
  const [date, setDate] = useState(new Date())
  const [currentDateChoice, setCurrentDateChoice] = useState({
    date: new Date(),
    breakfast: '',
    breakfastQty: 1,
    lunch: '',
    lunchQty: 1,
    dinner: '',
    dinnerQty: 1
  })
  const [currentDateChoiceExisting, setCurrentDateChoiceExisting] = useState({})



  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data } = await axios.get(`/api/profile/${id}`)
        setProfile(data)
        setRecipesToDisplay(data.yourRecipes)
        setMyAndFavRecipes([...data.yourRecipes, ...data.favRecipes])
        setFollowerCount(data.followers.length)
        //setFollowToDisplay(data.followers)
      } catch (err) {
        console.log(err)
      }
    }
    getProfile()
  }, [])

  useEffect(() => {
    const getFollowersAndFollowing = async () => {
      try {
        let followingToAdd = []
        for (let i = 0; i < profile.following.length; i++) {
          const { data } = await axios.get(`/api/profile/${profile.following[i]}`)
          followingToAdd = [...followingToAdd, { _id: data._id, username: data.username, profileImage: data.profileImage }]
        }
        setFollowing([...followingToAdd])
        let followersToAdd = []
        for (let i = 0; i < profile.followers.length; i++) {
          const { data } = await axios.get(`/api/profile/${profile.followers[i]}`)
          followersToAdd = [...followersToAdd, { _id: data._id, username: data.username, profileImage: data.profileImage }]
        }
        setFollowers([...followersToAdd])
      } catch (error) {
        console.log(error)
      }
    }
    getFollowersAndFollowing()
  }, [profile])

  useEffect(() => {
    setFollowToDisplay(followers)
  }, [followers])



  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const payload = getPayload()
        const { data } = await axios.get(`/api/profile/${payload.sub}`)
        setCurrentUser(data)
        if (data.following.some(followingprofile => followingprofile._id === profile._id)) {
          setIsUserFollowing(true)
        }
        if (data._id === profile._id) {
          setIsOwnProfile(true)
        }
      } catch (err) {
        console.log(err)
      }
    }
    getCurrentUser()
  }, [profile])

  useEffect(() => {
    const getFollowersRecipes = async () => {
      try {
        let recipesToAdd = []
        for (let i = 0; i < currentUser.following.length; i++) {
          const { data } = await axios.get(`/api/profile/${currentUser.following[i]}`)
          recipesToAdd = [...recipesToAdd, ...data.yourRecipes]
        }
        const recipesToAddInDateOrder = recipesToAdd.sort(function (a, b) {
          var x = a['updatedAt']; var y = b['updatedAt'];
          return ((x > y) ? -1 : ((x < y) ? 1 : 0));
        });
        setRecentlyAdded(recipesToAddInDateOrder)
      } catch (err) {
        console.log(err)
      }
    }
    getFollowersRecipes()
  }, [currentUser])




  const handleFilter = (e) => {
    if (e.target.value === 'myRecipes') {
      setRecipesToDisplay(profile.yourRecipes)
      setCurrentFilter('userRecipes')
    }
    if (e.target.value === 'favRecipes') {
      setRecipesToDisplay(profile.favRecipes)
      setCurrentFilter(`favRecipes`)
    }
    if (e.target.value === 'allRecipes') {
      setRecipesToDisplay(myAndFavRecipes)
      setCurrentFilter('allRecipes')
    }
  }

  const handleFollow = async () => {
    if (!currentUser._id) {
      navigate('/login')
    } else {
      await axios.get(`/api/following/${profile._id}`, {
        headers: {
          Authorization: `Bearer ${getTokenFromLocalStorage()}`,
        }
      })
      setIsUserFollowing(true)
      //setFollowerCount(followerCount + 1)
      const getProfile = async () => {
        try {
          const { data } = await axios.get(`/api/profile/${id}`)
          setProfile(data)
          setFollowerCount(data.followers.length)
        } catch (err) {
          console.log(err)
        }
      }
      getProfile()
    }
  }

  const handleUnfollow = async () => {
    await axios.delete(`/api/following/${profile._id}`, {
      headers: {
        Authorization: `Bearer ${getTokenFromLocalStorage()}`,
      }
    })
    setIsUserFollowing(false)
    //setFollowerCount(followerCount - 1)
    const getProfile = async () => {
      try {
        const { data } = await axios.get(`/api/profile/${id}`)
        setProfile(data)
        setFollowerCount(data.followers.length)
      } catch (err) {
        console.log(err)
      }
    }
    getProfile()
  }

  const showPopUpOn = () => {
    setShowPopUp(true)
  }
  const showPopUpOff = () => {
    setShowPopUp(false)
  }

  const handlePopUpFilter = (e) => {
    if (e.target.value === 'followers') {
      setFollowToDisplay(followers)
      setCurrentFollowFilter('followers')
    }
    if (e.target.value === 'following') {
      setFollowToDisplay(following)
      setCurrentFollowFilter('following')
    }
  }

  const onCalChange = date => {
    setDate(date)
    setCalendarPopup(true)
    setCurrentDateChoice({ ...currentDateChoice, date: date })
    if (currentUser.mealPlan.some(day => Date.parse(day.date) === Date.parse(date))) {
      setCurrentDateChoiceExisting(currentUser.mealPlan.find(day => Date.parse(day.date) === Date.parse(date)))
    } else {
      setCurrentDateChoiceExisting({})
    }

  }

  const calendarExit = () => {
    setCalendarPopup(false)
    setCurrentDateChoice({})
  }

  const handleMealPlanChange = (e) => {
    setCurrentDateChoice({ ...currentDateChoice, [e.target.name]: e.target.value })
  }

  const submitMealPlan = async () => {
    if (currentDateChoiceExisting.date) {
      currentUser.mealPlan.splice(currentUser.mealPlan.indexOf(currentDateChoiceExisting), 1, currentDateChoice)
      setCurrentDateChoiceExisting(currentDateChoice)
    } else {
      currentUser.mealPlan.push(currentDateChoice)
      setCurrentDateChoiceExisting(currentDateChoice)
    }
    try {
      await axios.put(`/api/profile/${currentUser._id}`, { mealPlan: currentUser.mealPlan }, {
        headers: {
          Authorization: `Bearer ${getTokenFromLocalStorage()}`
        }
      })
    } catch (err) {
      console.log(err)
    }
  }




  return (
    !isOwnProfile ?
      <section className='profile-page'>
        <Nav />
        <div className='profile-card'>
          {showPopUp &&
            <div className='follower-following-popup'>
              <div className='follower-following-header'>
                <div className='filter-options'>
                  <button onClick={handlePopUpFilter} value='followers' className='left-button' id={currentFollowFilter === 'followers' && 'bold'}>Followers</button>
                  <button onClick={handlePopUpFilter} value='following' id={currentFollowFilter === 'following' && 'bold'}>Following</button>
                </div>
              </div>
              <div className='profile-list-display'>
                {followToDisplay.map((profile, index) =>
                  <div className='profile-list-item' onClick={() => window.location.assign(`/profile/${profile._id}`)}>
                    {!profile.profileImage ?
                      <img src={profilePlaceholder} alt='placeholder recipe' />
                      :
                      <img src={profile.profileImage} alt={profile.title} />}
                    <p>{profile.username}</p>
                  </div>

                )}
              </div>
              <div className='button-container'>
                <button className='green-branded-button' onClick={showPopUpOff}>Close</button>
              </div>
            </div>}
          <div className='pic-and-name-container'>
            {!profile.profileImage ?
              <img src={profilePlaceholder} alt='placeholder recipe' />
              :
              <img src={profile.profileImage} alt={profile.title} />}
            <div className='name-container'>
              {!profile.name ?
                <h2>{profile.username}</h2>
                :
                <h2>{profile.name}</h2>}
              <h4>{profile.username}</h4>
            </div>
          </div>
          <div className='bio-container'>
            {!profile.bio ?
              <p>Hello, my name is {!profile.name ? profile.username : profile.name}</p>
              :
              <p>{profile.bio}</p>
            }
          </div>
          <div className='profile-stats-container'>
            <ul>
              <li>{!profile.name ? profile.username : profile.name}'s Recipes</li>
              <li>{!profile.name ? profile.username : profile.name}'s Favourites</li>
              <li onClick={showPopUpOn}>Followers</li>
              <li onClick={showPopUpOn}>Following</li>
            </ul>
            {profile.yourRecipes ?
              <ul>
                <li>{profile.yourRecipes.length}</li>
                <li>{profile.favRecipes.length}</li>
                <li onClick={showPopUpOn}>{followerCount}</li>
                <li onClick={showPopUpOn}>{profile.following.length}</li>
              </ul>
              :
              <p></p>
            }
          </div>
          <div className='button-container'>
            {currentUser.following ?
              isUserFollowing ?
                <button className='green-branded-button' onClick={handleUnfollow}>UNFOLLOW</button>
                :
                <button className='green-branded-button' onClick={handleFollow}>FOLLOW</button>
              :
              <></>
            }
          </div>
        </div>
        <div className='profile-main-section'>
          <div className='profile-main-section-header'>
            <div className='filter-options'>
              <button onClick={handleFilter} value='myRecipes' className='left-button' id={currentFilter === 'userRecipes' && 'bold'}>{!profile.name ? profile.username : profile.name}'s Recipes</button> {/**************************** add on click to filter display array- also fade or highlight selected ********************/}
              <button onClick={handleFilter} value='favRecipes' className='middle-button' id={currentFilter === 'favRecipes' && 'bold'}>{!profile.name ? profile.username : profile.name}'s Favourites</button>
              <button onClick={handleFilter} value='allRecipes' className='right-button' id={currentFilter === 'allRecipes' && 'bold'}>All</button>
            </div>
          </div>
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
        </div>
      </section>

      :

      <section className='profile-page'>
        <Nav />
        <div className='profile-card'>
          {showPopUp &&
            <div className='follower-following-popup'>
              <div className='follower-following-header'>
                <div className='filter-options'>
                  <button onClick={handlePopUpFilter} value='followers' className='left-button' id={currentFollowFilter === 'followers' && 'bold'}>Followers</button> {/**************************** add on click to filter display array- also fade or highlight selected ********************/}
                  <button onClick={handlePopUpFilter} value='following' id={currentFollowFilter === 'following' && 'bold'}>Following</button>
                </div>
              </div>
              <div className='profile-list-display'>
                {followToDisplay.map((profile, index) =>
                  <div className='profile-list-item' onClick={() => window.location.assign(`/profile/${profile._id}`)}>
                    {!profile.profileImage ?
                      <img src={profilePlaceholder} alt='placeholder recipe' />
                      :
                      <img src={profile.profileImage} alt={profile.title} />}
                    <p>{profile.username}</p>
                  </div>
                )}
              </div>
              <div className='button-container'>
                <button className='green-branded-button' onClick={showPopUpOff}>Close</button>
              </div>
            </div>}
          {calendarPopup &&
            <div className='calendar-popup'>
              <h2>{date.toDateString()}</h2>
              <h3>Breakfast:</h3>
              <p>{myAndFavRecipes.find(recipe => recipe._id === currentDateChoiceExisting.breakfast) ? `${myAndFavRecipes.find(recipe => recipe._id === currentDateChoiceExisting.breakfast).title} x ${currentDateChoiceExisting.breakfastQty}` : ''}</p>
              <select onChange={handleMealPlanChange} name='breakfast'>
                <option value='' selected='selected' disabled>-select-</option>
                <option value=''>none</option>
                {myAndFavRecipes.map((recipe, index) =>
                  <option key={index} value={recipe._id}>{recipe.title}</option>)}
              </select>
              <select onChange={handleMealPlanChange} name='breakfastQty'>
                <option>1</option>
                <option>2</option>
                <option>3</option>
                <option>4</option>
              </select>
              <h3>Lunch:</h3>
              <p>{myAndFavRecipes.find(recipe => recipe._id === currentDateChoiceExisting.lunch) ? `${myAndFavRecipes.find(recipe => recipe._id === currentDateChoiceExisting.lunch).title} x ${currentDateChoiceExisting.lunchQty}` : ''}</p>
              <select onChange={handleMealPlanChange} name='lunch'>
                <option value='' selected='selected' disabled>-select-</option>
                <option value=''>none</option>
                {myAndFavRecipes.map((recipe, index) =>
                  <option key={index} value={recipe._id}>{recipe.title}</option>)}
              </select>
              <select onChange={handleMealPlanChange} name='lunchQty'>
                <option>1</option>
                <option>2</option>
                <option>3</option>
                <option>4</option>
              </select>
              <h3>Dinner:</h3>
              <p>{myAndFavRecipes.find(recipe => recipe._id === currentDateChoiceExisting.dinner) ? `${myAndFavRecipes.find(recipe => recipe._id === currentDateChoiceExisting.dinner).title} x ${currentDateChoiceExisting.dinnerQty}` : ''}</p>
              <select onChange={handleMealPlanChange} name='dinner'>
                <option value='' selected='selected' disabled>-select-</option>
                <option value=''>none</option>
                {myAndFavRecipes.map((recipe, index) =>
                  <option key={index} value={recipe._id}>{recipe.title}</option>)}
              </select>
              <select onChange={handleMealPlanChange} name='dinnerQty'>
                <option>1</option>
                <option>2</option>
                <option>3</option>
                <option>4</option>
              </select>
              <div className='button-container'>
                <button className='green-branded-button' onClick={submitMealPlan}>CONFIRM</button>
                <button className='green-branded-button' onClick={calendarExit}>CANCEL</button>
              </div>
            </div>
          }
          <div className='pic-and-name-container'>
            {!profile.profileImage ?
              <img src={profilePlaceholder} alt='placeholder recipe' />
              :
              <img src={profile.profileImage} alt={profile.title} />}
            <div className='name-container'>
              {!profile.name ?
                <h2>{profile.username}</h2>
                :
                <h2>{profile.name}</h2>}
              <h4>{profile.username}</h4>
            </div>
          </div>
          <div className='bio-container'>
            {!profile.bio ?
              <p>Hello, my name is {!profile.name ? profile.username : profile.name}</p>
              :
              <p>{profile.bio}</p>
            }
          </div>
          <div className='profile-stats-container'>
            <ul>
              <Link to='/myrecipes'><li>My Recipes</li></Link>
              <Link to='/myrecipes'><li>My Favourites</li></Link>
              <li onClick={showPopUpOn}>Followers</li>
              <li onClick={showPopUpOn}>Following</li>
            </ul>
            {profile.yourRecipes ?
              <ul>
                <Link to='/myrecipes'><li>{profile.yourRecipes.length}</li></Link>
                <Link to='/myrecipes'><li>{profile.favRecipes.length}</li></Link>
                <li onClick={showPopUpOn}>{followerCount}</li>
                <li onClick={showPopUpOn}>{profile.following.length}</li>
              </ul>
              :
              <p></p>
            }
          </div>
          <div className='button-container'>
            <Link to='/updateprofile'><button className='green-branded-button' >EDIT PROFILE</button></Link>
            <Link to='/addrecipe'><button className='green-branded-button' >ADD RECIPE</button></Link>
          </div>
        </div>
        <div className='profile-main-section'>
          <div className='calander-section'>
            <h3>MEAL PLAN</h3>
            <div className='calander-container'>
              <Calendar onChange={onCalChange} value={date} />
            </div>
          </div>
          <h3 className='recently-added-title'>Recently Added</h3>
          <div className='display-recipe-bar'>
            {recentlyAdded.length > 0 ?
              recentlyAdded.map((recipe, index) =>
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
                      <p>{recipe.avgRating}</p>
                    </div>
                  </div>
                </Link>
              )
              :
              <div className='recipe-card'>
                <div className='recipe-image-container'>
                  <img src={recipePlaceholder} alt='placeholder recipe' />
                </div>
                <div className='text-container'>
                  <h3>Follow some active users and see their most recent recipes display here!</h3>
                </div>
              </div>
            }
          </div>
        </div>
      </section>
  )
}

export default ProfileOther