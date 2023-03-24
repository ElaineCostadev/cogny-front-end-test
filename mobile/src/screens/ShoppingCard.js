import { View, Text, TouchableOpacity, Image, ImageBackground } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import React, { useContext, useEffect, useState } from 'react'
import { ProductsContextApp } from '../context/ProductsContextApp';
import { FlatList } from 'react-native-gesture-handler';
import { db } from "../config/firebaseConnectionApp";
import styles from '../styles/ShoppingCard.styles';
import { addDoc, collection } from 'firebase/firestore';

const ShoppingCard = () => {
  const { card, setCard, removeButtom } = useContext(ProductsContextApp);
  const [totalPrice, setTotalPrice] = useState();

  const navigation = useNavigation(); 
  const checkoutCollectionRef = collection(db, "checkout")

  useEffect(() => {
    const total = card.reduce((acc, curr) => acc + Number(subTotal(curr.price, curr.quantity)), null)?.toFixed(2)
    setTotalPrice(total)
  }, [card])


  const addQuantity = (id) => {
    const updatedCart = card.map((cardItem) => (cardItem.id === id.id
      ? {
        ...cardItem,
        quantity: Number(cardItem.quantity) + 1,
      }
      : cardItem));

    setCard(updatedCart);
    return;
  }

  const subQuantity = (id) => {
    const updatedCart = card.map((cardItem) => (
      cardItem.id === id.id && cardItem.quantity > 1 ?
      {
      ...cardItem,
      quantity: Number(cardItem.quantity) - 1
      } : cardItem ));

        setCard(updatedCart);
    return;
  }

  const subTotal = (price, quantity) => {
    return (Number(price) * Number(quantity)).toFixed(2)
  }

  const finishOrder = async () => {
    const saveCheckoutDb  = await card.map(async (eachCart) => {
      const savedWithouImage = {
        brand: await eachCart.brand,
        description: await eachCart.description,
        price: await eachCart.price,
        quantity: await eachCart.quantity,
        total: totalPrice,
      }
      const savedInDB = await addDoc(checkoutCollectionRef, savedWithouImage)
      if(savedInDB) {
        // setMessage(true)
        setTotalPrice(null)
        setCard([])
        navigation.navigate('Home')
        // setTimeout(() => setMessage(false), 1000) 
        return saveCheckoutDb
      }
    })
  }

  return (
    <View style={styles.shoppingContainer}>
      <FlatList
          showsVerticalScrollIndicator={false}
          data={card}
          renderItem={({ item }) => {
            return (
              <View style={styles.cardContainer}>

                <View>
                <Text style={styles.brandText}>{item.brand}</Text>
                <TouchableOpacity
                  onPress={ () => removeButtom({id: item.id})}
                  style={styles.removeButtom}>
                  <Text style={styles.removeTextButtom}>X</Text>
                </TouchableOpacity>
                <Image
                  style={ styles.cardImage}
                  source={{ uri: item.urlImage }}
                />
                </View>

                <Text style={styles.descriptionText}>{item.description}</Text>
                <Text style={styles.priceText}>R$ {item.price},00</Text>

                <View style={styles.quantityContainer}>
                <TouchableOpacity
                  onPress={ () => addQuantity({id: item.id})}
                  style={styles.quantityButtom}>
                  <Text style={styles.quantityButtomText}>+</Text>
                </TouchableOpacity>
                <Text style={styles.quantity}>{item.quantity}</Text>
                <TouchableOpacity
                  onPress={ () => subQuantity({id: item.id})}
                  style={styles.quantityButtom}>
                  <Text style={styles.quantityButtomText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.subTotal}>R$ {subTotal(item.price, item.quantity)}</Text>
                </View>                
              </View>
            )
          }}
          keyExtractor={item => item.id}>
      </FlatList>
      <View style={styles.totalContainer}>
      <Text style={styles.total}>Total</Text>
      <Text style={styles.totalText}>R$ {totalPrice}</Text>
      <TouchableOpacity
        onPress={ () => finishOrder()}
        style={styles.finishOrderButtom}>
        <Text style={styles.finishOrderText}>FINALIZAR PEDIDO</Text>
      </TouchableOpacity>
      </View>
    </View>
  )
}

export default ShoppingCard