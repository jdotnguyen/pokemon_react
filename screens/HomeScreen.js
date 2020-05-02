import React, { Component } from 'react';
import { Text, View, StyleSheet, SafeAreaView, ScrollView, Image } from 'react-native';
import Constants from "expo-constants";
import { fetchPokemon } from '../shared/api/pokemon';
import { TouchableOpacity } from 'react-native-gesture-handler';

export default class LotsOfGreetings extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);

    this.state = {
      pokemon: []
    }

    // Item component
    this.pokeItem = ({ pokemon, pokeId }) => (
      <View style={styles.item}>
        <TouchableOpacity style={styles.pokebutton} onPress={() => this.onPressPokemon(pokemon, pokeId)}>
          <Text style={styles.pokenumber}>{pokeId}</Text>
          <Text style={styles.title}>{pokemon.name}</Text>
          <Image style={styles.pokemon} source={{ uri: pokemon.img }} />
        </TouchableOpacity>
        { pokemon.touched && 
        <TouchableOpacity style={styles.pokemonInfoOverlay}>
          <Text>Test</Text>
        </TouchableOpacity>}
      </View>
    );
  }

  componentDidMount() {
    this._isMounted = true;

    // Get Pokemon list data
    this.getPokemon();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  // Get Pokemon list data
  getPokemon = async () => {
    if (this._isMounted) {
      fetchPokemon()
        .then(response => {
          this.setState({ pokemon: response.results });

          // Get image URL
          let tempPokemonArray = this.state.pokemon.slice();
          tempPokemonArray.forEach((pokemon, index) => {
            pokemon['img'] = this.getPokePic((index + 1));
            pokemon['touched'] = false;
          });
          this.setState({ pokemon: tempPokemonArray });
        });
    }
  }

  // Get Pokemon picture URL
  getPokePic = (imgid) => {
    let url = 'https://pokeres.bastionbot.org/images/pokemon/' + imgid + '.png';
    return url;
  }

  // On press Pokemon handler
  onPressPokemon = (pokemon, pokemonId) => {
    pokemon.touched = !pokemon.touched;
    let tempPokemonArray = this.state.pokemon.slice();
    tempPokemonArray.filter((pokemon, index) => {
      index != pokemonId
    });
    tempPokemonArray[(pokemonId - 1)] = pokemon;
    this.setState({ pkemon: tempPokemonArray });
  }
  
  render() {
    return (
      <SafeAreaView>
        <ScrollView>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {this.state.pokemon.map((item, index) => <this.pokeItem key={index} pokemon={item} pokeid={(index + 1)} />)}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Constants.statusBarHeight
  },
  item: {
    backgroundColor: "#fff",
    marginVertical: 10,
    marginHorizontal: 10,
    borderRadius: 20,
    shadowColor: '#cecece',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 2,
    width: '45%'
  },
  pokebutton: {
    alignItems: 'center',
    padding: 20,
  },
  pokenumber: {
    fontSize: 42,
    position: 'absolute',
    fontWeight: 'bold',
    color: '#eeeeee',
    marginLeft: 0,
    top: 0,
    left: 10
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    textTransform: 'capitalize',
    marginBottom: 15,
    position: 'relative',
    top: 6,
    color: '#000'
  },
  pokemon: {
    width: 80,
    height: 80
  },
  pokemonInfoOverlay: {
    width: '100%',
    height: '90%',
    backgroundColor: '#ffffff'
  }
});