export type Role = 'viewer' | 'editor' | 'admin';

export interface User {
    _id?:string;
    username?:string;
    email:string;
    password:string;
    role?: Role;

}