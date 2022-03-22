import { Scene } from "phaser";
//https://shakuro.com/blog/phaser-js-a-step-by-step-tutorial-on-making-a-phaser-3-game#part-2
export class LoadingScene extends Scene {
  constructor() {
    super('loading-scene')
  }
  create(): void {
    console.log('Loading scene was created')
  }
}