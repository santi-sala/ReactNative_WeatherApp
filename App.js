import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Button,
  Image,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Header, Input, Card } from 'react-native-elements';

import Dialog from 'react-native-dialog';
import useAxios from 'axios-hooks';

import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [modalVisible, setModalVisible] = useState(false);
  const [cityName, setCityName] = useState('');
  const [cities, setCities] = useState([]);

  // load cities when app starts
  useEffect(() => {
    getData();
  }, []);

  // save cities if cities state changes
  useEffect(() => {
    storeData();
  }, [cities]);

  const storeData = async () => {
    try {
      await AsyncStorage.setItem('@cities', JSON.stringify(cities));
    } catch (e) {
      console.log('Cities saving error!');
    }
  };

  const getData = async () => {
    try {
      const value = await AsyncStorage.getItem('@cities');
      if (value !== null) {
        setCities(JSON.parse(value));
      }
    } catch (e) {
      console.log('Cities loading error!');
    }
  };

  const openDialog = () => {
    setModalVisible(true);
  };

  const addCity = () => {
    setCities([...cities, { id: Math.random(), name: cityName }]);
    setModalVisible(false);
  };

  const cancelCity = () => {
    setModalVisible(false);
  };

  const deleteCity = (deleteCity) => {
    let filteredArray = cities.filter((city) => city.id !== deleteCity);
    setCities(filteredArray);
  };

  const WeatherForecast = (params) => {
    const city = params.city;
    const id = params.id;
    const API_KEY = 'bf63ddb6c1bf78dbf6986413c7dc73de';
    const URL = 'https://api.openweathermap.org/data/2.5/weather?q=';

    const [{ data, loading, error }, refetch] = useAxios(
      URL + city + '&appid=' + API_KEY + '&units=metric'
    );

    console.log(data);

    const refreshForecast = () => {
      refetch();
    };

    const deleteCity = () => {
      params.deleteCity(id);
    };

    if (loading)
      return (
        <Card>
          <Card.Title>Loading....</Card.Title>
        </Card>
      );

    if (error)
      return (
        <Card>
          <Card.Title>Error loading weather forecast!</Card.Title>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            <Button title="-delete-" onPress={deleteCity} />
            <Button title="-refresh-" onPress={refreshForecast} />
          </View>
        </Card>
      );

    console.log(`http://openweathermap.org/img/w/${data.weather[0].icon}.png`);

    return (
      <Card>
        <Card.Title style={{ fontSize: 30 }}>{city}</Card.Title>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <Text>Main: {data.weather[0].main}</Text>
            <Text>Temp: {data.main.temp} °C</Text>
            <Text>Humidity: {data.main.humidity}</Text>
            <Text>Feels like: {data.main.feels_like} °C</Text>
          </View>
          <View
            style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}
          >
            <Image
              style={{ height: 100, width: 100 }}
              source={{
                uri: `http://openweathermap.org/img/w/${data.weather[0].icon}.png`,
              }}
            />
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Button title="-delete-" onPress={deleteCity} />
          <Button title="-refresh-" onPress={refreshForecast} />
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaProvider>
      <Header
        centerComponent={{ text: 'Weather App', style: { color: '#fff' } }}
        rightComponent={{ icon: 'add', color: '#fff', onPress: openDialog }}
      />
      <ScrollView>
        {!modalVisible &&
          cities.map((city, index) => {
            return (
              <WeatherForecast
                key={index}
                id={city.id}
                city={city.name}
                deleteCity={deleteCity}
              />
            );
          })}
      </ScrollView>

      <Dialog.Container visible={modalVisible}>
        <Dialog.Title>Add a new city</Dialog.Title>
        <View>
          <Input
            onChangeText={(text) => setCityName(text)}
            placeholder="Type cityname here"
          />
        </View>
        <Dialog.Button label="Cancel" onPress={cancelCity} />
        <Dialog.Button label="Add" onPress={addCity} />
      </Dialog.Container>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
