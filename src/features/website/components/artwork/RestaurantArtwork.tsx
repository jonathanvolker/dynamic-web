export function RestaurantArtwork() {
  return (
    <div className="restaurant-illustration" aria-label="Ilustración de una mesa y un plato artesanal">
      <div className="restaurant-linen" />
      <div className="restaurant-plate"><span className="dish-leaf leaf-one" /><span className="dish-leaf leaf-two" /><span className="dish-leaf leaf-three" /><span className="dish-tomato tomato-one" /><span className="dish-tomato tomato-two" /><span className="dish-grain" /></div>
      <div className="restaurant-cutlery" aria-hidden="true"><span /><span /></div>
      <span className="restaurant-seal">HECHO<br />CON TIEMPO</span>
    </div>
  )
}
