export interface CartItem {
    _id:string,
    title:string,
    author:string,
    summary: string,
    price:number,
    quantity:number,
    coverImage?:string;
}