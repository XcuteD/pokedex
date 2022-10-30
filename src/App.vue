<template>
  <div @scroll="addSection" class="pokedex">
    <div class="pokedex__header">
      <div
        class="pokedex__title"
        :style="{
          background: createBackgroundString,
        }"
      >
        POKEDEX
      </div>
      <div class="pokedex__search">
        <label for="pokemon-search">Find your pokemon: </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          minlength="4"
          maxlength="8"
          size="10"
        />
      </div>
      <div class="pokedex__filter">
        <form>
          <label for="pokemon-select">Sort by: </label>
          <select name="pokemon" id="pokemon-select">
            <option value="id" selected>ID</option>
            <option value="name">name</option>
            <option value="type">type</option>
          </select>
        </form>
      </div>
    </div>
    <div class="pokedex__separator"></div>
    <div
      class="pokedex__section"
      v-for="(section, section_ID) in activeSections"
      :key="section_ID"
    >
      <div
        class="pokedex__card pokemon"
        v-for="pokemon in section"
        :key="pokemon.id"
      >
        <div class="pokemon__img">
          <img
            class="pokemon__img-item"
            :src="pokemon.img"
            :alt="pokemon.name"
          />
        </div>
        <div class="pokemon__id">№{{ pokemon.id }}</div>
        <div class="pokemon__name">{{ pokemon.name }}</div>
        <div class="pokemon__type">
          <div class="pokemon__type-item"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      pokemonCount: 0,
      pokemons: [],
      sections: [],
      activeSections: [],
    };
  },
  async mounted() {
    await this.getStartPokemonData();
    await this.getAllPokemonData();
  },
  computed: {
    createBackgroundString() {
      console.log(
        `linear-gradient(90deg, yellow ${
          ((this.sections.length * 20) / this.pokemonCount) * 100
        }%, white ${((this.sections.length * 20) / this.pokemonCount) * 100}%)`
      );
      return `linear-gradient(90deg, yellow ${
        ((this.sections.length * 20) / this.pokemonCount) * 100
      }%, white ${((this.sections.length * 20) / this.pokemonCount) * 100}%)`;
    },
  },
  methods: {
    async getStartPokemonData() {
      let url = "https://pokeapi.co/api/v2/pokemon";
      let response = await fetch(url);
      let pokemonPagination = await response.json();
      this.pokemonCount = pokemonPagination.count;
      await this.pushPokemons(pokemonPagination);
      await console.log(this.pokemons);
      await this.sections.push(this.pokemons);
      await this.activeSections.push(this.sections[this.activeSections.length]);
      this.pokemons = [];
    },
    async getAllPokemonData() {
      let url = "https://pokeapi.co/api/v2/pokemon";
      let response = await fetch(url);
      let pokemonPagination = await response.json();
      while (pokemonPagination.next != null) {
        response = await fetch(pokemonPagination.next);
        pokemonPagination = await response.json();
        await this.pushPokemons(pokemonPagination);
      }
    },
    async pushPokemons(obj) {
      for (let i = 0; i < obj.results.length; i++) {
        let url = obj.results[i].url;
        let response = await fetch(url);
        let pokemon = await response.json();
        await this.pokemons.push({
          id: String(pokemon.id).padStart(3, "0"),
          name: pokemon.name,
          img: `https://assets.pokemon.com/assets/cms2/img/pokedex/full/${String(
            pokemon.id
          ).padStart(3, "0")}.png`,
        });
      }
      this.sections.push(this.pokemons);
      this.pokemons = [];
    },
    addSection() {
      let pokedex = document.querySelector(".pokedex");
      if (pokedex.scrollTop + pokedex.clientHeight == pokedex.scrollHeight) {
        this.activeSections.push(this.sections[this.activeSections.length]);
      }
    },
  },
};
</script>
<style lang="scss" src="./app.scss"></style>
