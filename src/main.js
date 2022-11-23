import { createApp } from "vue";
import App from "./App.vue";
createApp(App).mount("#app");
import CircleType from "circletype";
const circleType = new CircleType(document.querySelector(".pokedex__title"));
circleType.radius(300);
