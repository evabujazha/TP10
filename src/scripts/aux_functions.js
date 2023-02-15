// Funcion para chequear si el ID de un producto ya esta siendo utilizado
export function checkId(product, arr){ 
    arr.forEach(element => {
        if(element.id == product.id){
            console.warn('El id del elemento ya existe, se le asignara uno nuevo.')
            return this.newId(product, arr)
        } 
    });
        return product.id
}
// Funcion asignar nuevo ID  
export function newId(product, arr){
    arr.sort((a, b) => {return a - b}) // Ordenamos de forma ascendente segun el id
    product.id = parseInt(arr[arr.length - 1].id) + 1 // Tomamos el id mas grande le sumamos 1 y lo asignamos al producto
    console.log(`Nuevo id del producto : ${product.id}`)
    return product.id
}
// Funcion consulta si un usuario ya esta en session
export function isLoggedIn(req, res, next){
    req.session.nombre ? next() : res.redirect("/")
  
}
// Funcion consulta si un usuario NO esta en session
export function isLoggedOut(req, res, next){
    req.session.nombre ? res.redirect('/home') : next()
}
// Funcion retorno Fecha
export function getTimestamp(){
    return (`${new Date().getDate()}/${new Date().getMonth() + 1}/${new Date().getFullYear()} - ${new Date().toLocaleTimeString('es-AR')}`)
}