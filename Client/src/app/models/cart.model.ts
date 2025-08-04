export interface CartItem {
    _id:string, // guest cart use this (might)
    bookId ?:{
            _id:string,
            title:string,
            author:string,
            genre:string,
            summary: string,
            price:number,
            quantity:number,
            coverImage?:string;
        }
    title:string,
    author:string,
    summary: string,
    price:number,
    quantity:number,
    coverImage?:string;
}