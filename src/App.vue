<template>
  <div class="pokedex">
    <div class="container">
      <div class="pokedex__header">
        <div class="pokedex__menu">
          <div class="pokedex__title" @click="this.openedCard = null">
            PoKeDeX
          </div>
          <div class="pokedex__search">
            <label for="pokemon-search">Find your pokemon: </label>
            <input
              @input="throttleInput"
              v-bind:value="inputField"
              v-on:input="inputField = $event.target.value"
              type="text"
              id="name"
              name="name"
              required
              minlength="1"
              maxlength="20"
              size="15"
            />
          </div>
        </div>
        <div class="pokedex__separator"></div>
      </div>

      <detailed-card
        class="detailedCard"
        v-if="openedCard"
        :pokemon="openedCard"
        :nextPokemon="nextCard"
        :prevPokemon="prevCard"
        @change-pokemon="updatePokemon"
      />

      <div class="pokedex__section" v-if="!openedCard">
        <div
          class="pokedex__card card"
          v-for="pokemon in hotPokemons"
          :key="pokemon.id"
          @click="openCard(pokemon)"
        >
          <div class="card__img">
            <img
              class="card__img-item"
              :src="pokemon.img"
              :alt="pokemon.name"
            />
          </div>
          <div class="card__id">№{{ String(pokemon.id).padStart(3, "0") }}</div>
          <div class="card__name">{{ pokemon.name.split("-").join(" ") }}</div>
          <div class="card__type">
            <div
              class="card__type-item"
              v-for="(type, index) in pokemon.types"
              :key="index"
              :class="`card__type-item_${type.name}`"
            >
              {{ type.name }}
            </div>
          </div>
        </div>
      </div>
      <button
        class="pokedex__load"
        v-if="!openedCard && coldPokemons.length > 0"
        @click="this.hotLoad"
      >
        LOAD MORE ({{ coldPokemons.length }})
      </button>
      <button
        class="pokedex__load"
        v-if="openedCard"
        @click="this.openedCard = null"
      >
        LOOK MORE POKEMONS
      </button>
    </div>
  </div>
</template>

<script>
import throttle from "lodash.throttle";
import detailedCard from "./components/detailed-card.vue";

export default {
  name: "App",
  components: {
    detailedCard,
  },
  data() {
    return {
      pokePaginationAPI: "https://pokeapi.co/api/v2/pokemon",
      genderAPI: "https://pokeapi.co/api/v2/gender/",
      typeAPI: "https://pokeapi.co/api/v2/type/",
      pokeDummyImage: "https://thumbs.gfycat.com/DampSpanishCleanerwrasse.webp",
      categoryAPI: "https://pokeapi.co/api/v2/pokemon-species/",
      gendersCount: 0,
      pokeGenders: {},
      pokeTypes: new Map(),
      inputField: "",
      pokemonCount: 0,
      pokeNames: [],
      lazyPokemons: [],
      coldPokemons: [],
      hotPokemons: [],
      openedCard: null,
      nextCard: null,
      prevCard: null,
      throttleInput: throttle(this.pokeSearch, 500, {
        leading: false,
        trailing: true,
      }),
    };
  },
  mounted() {
    this.loadPokemonList();
  },
  updated() {
    let pokedex = document.querySelector(".pokedex");
    pokedex.scrollTop = 0;
  },
  methods: {
    async loadPokemonList() {
      await this.pokeGenderSet();
      await this.pokeWeaknessesSet();
      await this.lazyLoad();
      await this.hotLoad();
    },

    loadJson(url) {
      return fetch(url).then((response) => response.json());
    },

    async pokeGenderSet() {
      let genders = await this.loadJson(this.genderAPI);
      this.gendersCount = genders.count;

      for (let i = 1; i <= this.gendersCount; i++) {
        let gender = await this.loadJson(this.genderAPI + i);
        this.pokeGenders[gender.name] = new Set();
        gender.pokemon_species_details.forEach((pokemon) => {
          this.pokeGenders[gender.name].add(pokemon.pokemon_species.name);
        }, this);
      }
    },

    async pokeWeaknessesSet() {
      let promiseArr = [];
      let types = await this.loadJson(this.typeAPI);

      types.results.forEach(function (type) {
        this.pokeTypes.set(type.name, { url: type.url });
      }, this);
      this.pokeTypes.forEach(function (pokeType) {
        promiseArr.push(this.loadJson(pokeType.url));
      }, this);

      return Promise.all(promiseArr).then((types) => {
        types.forEach(function (type) {
          this.pokeTypes.set(type.name, { weaknesses: [], resistances: [] });
          type.damage_relations.double_damage_from?.forEach(function (
            weakness
          ) {
            this.pokeTypes.get(type.name).weaknesses.push(weakness.name);
          },
          this);
          type.damage_relations.half_damage_from?.forEach(function (
            resistance
          ) {
            this.pokeTypes.get(type.name).resistances.push(resistance.name);
          },
          this);
          type.damage_relations.no_damage_from?.forEach(function (resistance) {
            this.pokeTypes.get(type.name).resistances.push(resistance.name);
          }, this);
        }, this);
      });
    },

    async lazyLoad() {
      let pokePagination = await this.loadJson(this.pokePaginationAPI);
      pokePagination = await this.loadJson(
        `${this.pokePaginationAPI}?limit=${(this.pokemonCount =
          pokePagination.count)}`
      );

      pokePagination.results.forEach(function (pokemon, index) {
        this.pokeNames.push(pokemon.name);
        this.lazyPokemons.push({
          id: index + 1,
          name: pokemon.name,
          img: this.pokeDummyImage,
          pokeAPI: pokemon.url,
        });
      }, this);
      this.coldPokemons = [...this.lazyPokemons];
    },

    async hotLoad() {
      await this.coldLoad();
      let limit = this.coldPokemons.length > 20 ? 20 : this.coldPokemons.length;
      this.hotPokemons.push(...this.coldPokemons.splice(0, limit));
    },

    coldLoad() {
      let promiseArr = [];
      let limit = this.coldPokemons.length > 20 ? 20 : this.coldPokemons.length;

      for (let i = 0; i < limit; i++) {
        if (this.coldPokemons[i] != this.pokeDummyImage) {
          promiseArr.push(this.loadJson(this.coldPokemons[i].pokeAPI));
        }
      }
      return Promise.all(promiseArr).then((pokemons) => {
        pokemons.forEach(async function (pokemon, index) {
          this.coldPokemons[index].abilities = [];
          for (let i = 0; i < pokemon.abilities.length; i++) {
            this.coldPokemons[index].abilities.push({
              name: pokemon.abilities[i].ability.name.split("-").join(" "),
              url: pokemon.abilities[i].ability.url,
            });
          }
          this.coldPokemons[index].types = [];
          this.coldPokemons[index].weaknesses = [];
          let weaknesses = [];
          let resistances = [];

          for (let i = 0; i < pokemon.types.length; i++) {
            weaknesses.push(
              ...this.pokeTypes.get(pokemon.types[i].type.name).weaknesses
            );
            resistances.push(
              ...this.pokeTypes.get(pokemon.types[i].type.name).resistances
            );
          }

          this.coldPokemons[index].weaknesses = weaknesses.filter(
            (weakness) => !resistances.includes(weakness)
          );

          for (let i = 0; i < pokemon.types.length; i++) {
            this.coldPokemons[index].types.push({
              name: pokemon.types[i].type.name,
              url: pokemon.types[i].type.url,
            });
          }
          this.coldPokemons[index].gender = this.pokeGenderGet(pokemon.name);
          this.coldPokemons[index].height = pokemon.height;
          this.coldPokemons[index].weight = pokemon.weight;
          this.coldPokemons[index].img =
            pokemon.sprites.other["official-artwork"].front_default ||
            pokemon.sprites.other.home.front_default ||
            this.pokeDummyImage;
          this.coldPokemons[index].category = await this.pokeCategorySet(
            pokemon.name
          );
        }, this);
      });
    },

    pokeGenderGet(pokeName) {
      let gender = [];

      if (this.pokeGenders.male.has(pokeName)) gender.push("male");
      if (this.pokeGenders.female.has(pokeName)) gender.push("female");
      if (this.pokeGenders.genderless.has(pokeName)) gender.push("genderless");

      return gender;
    },

    async pokeCategorySet(pokeName) {
      let species = await this.loadJson(`${this.categoryAPI}${pokeName}`);
      let category = species.genera[7].genus;

      return category.split(" ").slice(0, -1).join(" ");
    },

    pokeSearch() {
      console.log("Поиск " + this.inputField);
      this.coldPokemons = [];
      this.hotPokemons = [];

      let searchResults = this.pokeNames.reduce(
        (res, el, index) => {
          if (el.indexOf(this.inputField.toLowerCase()) == 0)
            return [[...res[0], index], [...res[1]]];
          else if (el.indexOf(this.inputField.toLowerCase()) > 0)
            return [[...res[0]], [...res[1], index]];
          else return [[...res[0]], [...res[1]]];
        },
        [[], []]
      );

      searchResults = [...searchResults[0], ...searchResults[1]];

      if (searchResults.length) {
        searchResults.forEach((el) => {
          this.coldPokemons.push(this.lazyPokemons[el]);
        }, this);
        this.hotLoad();
      } else {
        searchResults = [];
      }
    },

    openCard(pokemon) {
      this.openedCard = pokemon;

      if (pokemon.id == this.lazyPokemons.length) {
        this.nextCard = this.lazyPokemons[0];
      } else {
        this.nextCard = this.lazyPokemons[pokemon.id];
      }

      if (pokemon.id == 1) {
        this.prevCard = this.lazyPokemons[this.lazyPokemons.length - 1];
      } else {
        this.prevCard = this.lazyPokemons[pokemon.id - 2];
      }
    },

    async updatePokemon(id) {
      if (id == 0) {
        this.coldPokemons = [];
        this.coldPokemons.push(this.lazyPokemons[this.lazyPokemons.length - 1]);
        await this.hotLoad();
        this.openCard(this.lazyPokemons[this.lazyPokemons.length - 1]);
      } else if (id == this.lazyPokemons.length + 1) {
        this.coldPokemons = [];
        this.coldPokemons.push(this.lazyPokemons[0]);
        await this.hotLoad();
        this.openCard(this.lazyPokemons[0]);
      } else {
        this.coldPokemons = [];
        this.coldPokemons.push(this.lazyPokemons[id - 1]);
        await this.hotLoad();
        this.openCard(this.lazyPokemons[id - 1]);
      }
    },
  },
};
</script>
<style lang="scss" src="./app.scss"></style>
