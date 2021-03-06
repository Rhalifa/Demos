import express from 'express'
import { users } from '../state';
import { User } from '../models/user';
import { authorization } from '../middleware/auth.middleware';
import { getAllUsersService, findUserByIdService, findUserByUsernameAndPasswordService } from '../service/users.service';



export const userRouter = express.Router()
//what this does is make all endpoints in this router restricted to admins only
//if this is here only admins can use any endpoints in this router
//this is probably not what we want
//userRouter.use(authorization(['admin']))

//get methods of the base path should give all information
userRouter.get('',[authorization(['admin']), async (req, res)=>{
    res.json( await getAllUsersService())
}])


//An endpoint to add a new user to the users state
//we should verify that the fields they send us are correct
//also that they are all there

//endpoint for making a new user
userRouter.post('', [authorization(['admin', 'partner']),(req, res)=>{
    let {body} = req //destructuring
    let newUser = new User() // make a new user
    for(let key in newUser ){//loop through all fields on user
        if(!body[key]){//if they didn't give us one
            res.status(400).send('please include all user fields')//fail
            break;
        }else{
            newUser[key] = body[key]//else set new field
        }
    }
    if(!res.finished){
        users.push(newUser)//add user to state
        res.json(newUser)//send back new user
    }
}])


//an endpoint to find 1 user by their id
//for the unique id we can put the colon after the base path
//for all other fields, we need to give them an addition name

// '/users/:id
// '/users/username/:username
// '/users/favoriteartist/artistname/:name

userRouter.get('/:id', async (req, res)=>{
    let id = +req.params.id//id is string by default, adding the + turns to int
    if(isNaN(id)){
        res.sendStatus(400)
    }else {
        let user = await findUserByIdService(id)
        if(user){
            res.json(user)
         } else {
            res.sendStatus(400)
        }
    }
})

//lets make a login endpoint
userRouter.post('/login', async (req, res)=>{
    const {username, password} = req.body
    let user = await findUserByUsernameAndPasswordService(req, username, password)

    if(typeof(user) === 'string'){
        res.sendStatus(401)
    } else{
        res.send(JSON.stringify(user))// don't send them the session
        //we send them their user object
    }
})

//updateding a user
//we amalgamated find user by id and post a new user

//express make a variable in req.params called id with the value from the url
userRouter.patch('/:id', [authorization(['admin']), (req, res) =>{
    let id = +req.params.id
    let user = users.find((u) =>{ 
        return u.id === id
    })
    if(user){
        let {body} = req
        for(let key in user ){//loop through all fields on user
            if(!body[key]){//if they didn't give us one
              
            }else{
                user[key] = body[key]//else set new field
            }
        }
        res.json(user)
    } else {
        res.sendStatus(400)
    }
}])