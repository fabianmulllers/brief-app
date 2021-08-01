import { Request, Response } from "express";
import bcrypt from 'bcrypt'

import * as helpers from '../helpers'
import { Area, Role, Usuario } from "../models";
import { Model } from "sequelize/types";
import Server from "../models/server";


export const obtenerUsuarios = async ( req: Request, res: Response) => {

    try {

        const usuarios = await Usuario.findAll( { 
            attributes:['nombre','email','avatar'],
            where: { estado: true }, 
            include:[
                {
                    model: Area,
                    attributes:[['are_id','id'],'nombre']
                },
                {
                    model:Role,
                    attributes:[['rol_id','id'],'nombre']
                }
            ],

         });
        
        return res.json( usuarios );

    } catch (error) {
        console.log( error );
        return res.status(500).json({
            msg: helpers.errorServidor()
        });
    }

}

export const obtenerUsuario = async ( req: Request, res: Response) => {
    
    try {
         
        const { id } = req.params
        
        const usuario: any = await Usuario.findByPk( 
            id,
            // {
            //     include:[
            //         {
            //             model: Area,
            //             attributes:['nombre']
            //         },
            //         {
            //             model: Role,
            //             attributes:['nombre']
            //         }
            //     ]
            // } 
        ).then( (user:any) => {
            user.getRole().then( (role:any) => {
                res.json(role)
            })
        })



        // return res.json( usuario )

    } catch (error) {
        
        console.log( error );
        return res.status(500).json({
            msg: helpers.errorServidor()
        });
    }

}

export const crearUsuario = async( req: Request, res: Response) => {
    
    try {

        const {area, role, ...user} = req.body;
        
        const salt = bcrypt.genSaltSync();
        user.password = bcrypt.hashSync(user.password, salt);
        
        user.are_id = area;
        user.rol_id = role;
        
        const usuario: any = await Usuario.create( user )
            .catch( (error) => {
                return res.status(400).json({
                   msg: error.errors[0].message
                })
            } );

        
        const resp = await Usuario.findByPk( 
            usuario.usu_id,
            {
                include:[
                    {
                        model: Area,
                        attributes:['nombre']
                    },
                    {
                        model: Role,
                        attributes:['nombre']
                    }
                ]
            })
       
        return res.json( resp )
        
    } catch (error) {
        
        console.log( error )
        return res.status(500).json({
            msg: helpers.errorServidor()
        })

    }

}

export const actualizarUsuario = async( req: Request, res: Response) => {
    try {

        const { id } = req.params;
        const { estado, password, ...user } = req.body;
        
        const usuario = await Usuario.findByPk( id );
            
        if( password ){
            const salt = bcrypt.genSaltSync();
            user.password = bcrypt.hashSync( password, salt );
        }
    
        await usuario?.update( user, { where: { usu_id: id } } );

        res.json( usuario);

    } catch (error) {
        
        console.log( error )
        return res.status(500).json({
            msg: "verificar"
        })

    }

}

export const eliminarUsuario = async( req: Request, res: Response) => {
    
    try {
            
        const { id } = req.params;
        
        const usuario =  await Usuario.findByPk( id )

        await usuario?.update(  {estado: false} , { where: { usu_id : id } } );

        return res.json( usuario )

    } catch (error) {

        console.log( error )
        return res.status(500).json({
            msg: helpers.errorServidor()
        })
    }

}
