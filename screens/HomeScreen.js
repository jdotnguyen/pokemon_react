import React, { Component } from 'react';
import { Text, View, StyleSheet, SectionList } from 'react-native';
import Constants from "expo-constants";
import { dataTypes } from '../shared/enum/main';
import { fetchPokemon } from '../shared/api/pokemon';
import { fetchMoves } from '../shared/api/moves';

export default class LotsOfGreetings extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);

    this.state = {
      sections: [
        {
          title: 'Pokemon',
          data: []
        },
        {
          title: 'Moves',
          data: []
        }
      ]
    }
  }

  componentDidMount() {
    this._isMounted = true;

    // Get Pokemon list data
    this.getPokemon();

    // Get Pokemon move list data
    this.getMoves();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  // Get Pokemon list data
  getPokemon = async () => {
    if (this._isMounted) {
      fetchPokemon()
        .then(response => {
          const newArray = this.state.sections.slice();
          newArray[dataTypes.POKEMON].data = response.results;
          this.setState({ sections: newArray });
        });
    }
  }

  // Get Pokemon list data
  getMoves = async () => {
    if (this._isMounted) {
      fetchMoves()
        .then(response => {
          const newArray = this.state.sections.slice();
          newArray[dataTypes.MOVES].data = response.results;
          this.setState({ sections: newArray })
        });
    }
  }
  
  render() {
    return (
      <View style={{ alignItems: 'center', top: 50 }}>
        <SectionList
          sections={this.state.sections}
          keyExtractor={(item, index) => item + index}
          renderItem={({ item }) => <Item title={item.name} />}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={StyleSheet.header}>{title}</Text>
          )}
          />
      </View>
    );
  }
}

class Greeting extends Component {
  render() {
    return (
      <View style={{ alignItems: 'center' }}>
        <Text>Hello {this.props.name}!</Text>
      </View>
    );
  }
}

const Item = ({ title }) => (
  <View style={styles.item}>
    <Text style={styles.title}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
          container: {
          flex: 1,
    marginTop: Constants.statusBarHeight,
    marginHorizontal: 16
  },
  item: {
          backgroundColor: "#f9c2ff",
    padding: 20,
    marginVertical: 8
  },
  header: {
          fontSize: 32,
    backgroundColor: "#fff"
  },
  title: {
          fontSize: 24
  }
});