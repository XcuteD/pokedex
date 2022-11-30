<template>
  <div class="pokemon">
    <div class="pokemon__pagination">
      <button
        class="pokemon__prev pokemon__button"
        @click="changePokemon(pokemon.id - 1)"
      >
        <div class="pokemon__button-text">
          {{
            "< " +
            prevPokemon.name.split("-").join(" ") +
            " №" +
            String(prevPokemon.id).padStart(3, "0")
          }}
        </div>
      </button>
      <button
        class="pokemon__next pokemon__button"
        @click="changePokemon(pokemon.id + 1)"
      >
        <div class="pokemon__button-text">
          {{
            nextPokemon.name.split("-").join(" ") +
            " №" +
            String(nextPokemon.id).padStart(3, "0") +
            "  >"
          }}
        </div>
      </button>
    </div>
    <div class="pokemon__card">
      <div class="pokemon__title">
        <p class="pokemon__name">
          {{ pokemon.name.split("-").join(" ") + " " }}
        </p>
        <p class="pokemon__id">№{{ String(pokemon.id).padStart(3, "0") }}</p>
      </div>
      <div class="pokemon__content">
        <img :src="pokemon.img" alt="" class="pokemon__img" />
        <div class="pokemon__specs">
          <div class="pokemon__stats">
            <div class="pokemon__flex-wrapper">
              <div class="pokemon__height">
                <p>Height</p>
                {{ `${(pokemon.height / 10).toFixed(1)} m` }}
              </div>
              <div class="pokemon__weight">
                <p>Weight</p>
                {{ `${(pokemon.weight / 10).toFixed(1)} kg` }}
              </div>
              <div class="pokemon__gender">
                <p>Gender</p>
                <div
                  class="pokemon__gender-item"
                  v-if="
                    pokemon.gender[0] == 'genderless' ||
                    pokemon.gender[0] == undefined
                  "
                >
                  Unknown
                </div>
                <div
                  class="pokemon__gender-item"
                  v-for="(gender, index) in pokemon.gender"
                  :key="index"
                  :class="`pokemon__gender-item_${gender}`"
                ></div>
              </div>
            </div>

            <div class="pokemon__flex-wrapper">
              <div class="pokemon__category">
                <p>Category</p>
                {{ pokemon.category ?? "Unknown" }}
              </div>
              <div class="pokemon__abilities">
                <p>Abilities</p>
                <div
                  class="pokemon__abilities-item"
                  v-for="(ability, index) in pokemon.abilities"
                  :key="index"
                >
                  {{ ability.name }}
                </div>
              </div>
            </div>
          </div>
          <div class="pokemon__flex-wrapper">
            <div class="pokemon__type">
              <p>Type</p>
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
            <div class="pokemon__weaknesses">
              <p>Weakness</p>
              <div class="card__type">
                <div
                  class="card__type-item"
                  v-for="(weakness, index) in pokemon.weaknesses"
                  :key="index"
                  :class="`card__type-item_${weakness}`"
                >
                  {{ weakness }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    pokemon: Object,
    nextPokemon: Object,
    prevPokemon: Object,
  },
  data() {
    return {};
  },
  methods: {
    changePokemon(id) {
      this.$emit("change-pokemon", id);
    },
  },
};
</script>

<style lang="scss" src="./detailed-card.scss"></style>
