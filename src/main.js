import { scaleFactor } from "./constants";
import { k } from "./kaboomCtx";
import { displayDialogue } from "./utils";

k.loadSprite("spritesheet", "./spritesheet.png", {
  sliceX: 39,
  sliceY: 31,
  anims: {
    "idle_down": 944,
    "walk_down": { from: 944, to: 947, loop: true, speed: 8 },
    "idle_side": 983,
    "walk_side": { from: 983, to: 986, loop: true, speed: 8 },
    "idle_up": 1022,
    "walk_up": { from: 1022, to: 1025, loop: true, speed: 8 },
  },
});

k.loadSprite("map", "./map.png");

k.setBackground(k.Color.fromHex("#311047"));

k.scene("main", async () => {
  const mapData = await (await fetch("./map.json")).json();
  const layers = mapData.layers;

  const map = k.add([k.sprite("map"), k.pos(0, 0), k.scale(scaleFactor)]);

  const player = k.add([
    k.sprite("spritesheet", { anim: "idle_down" }),
    k.area({
      shape: new k.Rect(k.vec2(0, 3), 10, 10),
    }),
    k.body(),
    k.anchor("center"),
    k.pos(),
    k.scale(scaleFactor),
    {
      speed: 250,
      direction: "down",
      isInDialogue: false,
    },
    "player",
  ]);

  for (const layer of layers) {
    if (layer.name === "boundaries") {
      for (const boundary of layer.objects) {
        map.add([
          k.area({
            shape: new k.Rect(k.vec2(0), boundary.width, boundary.height),
          }),
          k.body({ isStatic: true }),
          k.pos(boundary.x, boundary.y),
          boundary.name,
        ]);

        if (boundary.name) {
          player.onCollide(boundary.name, () => {
            player.isInDialogue = true;
            displayDialogue("TODO", () => (player.isInDialogue = false));
          });
        }
      }
      continue;
    }

    if (layer.name === "spawnpoints") {
      for (const entity of layer.objects) {
        if (entity.name === "player") {
          player.pos = k.vec2(
            (map.pos.x + entity.x) * scaleFactor,
            (map.pos.y + entity.y) * scaleFactor
          );
          //k.add(player);
          continue;
        }
      }
    }
  }

  setCamScale(k)

  k.onResize(() => {
    setCamScale(k);
  });


  k.onUpdate(() => {
    k.camPos(player.pos.x, player.pos.y + 100);
  });


  k.onMouseDown((mouseBtn) => {
  if (mouseBtn !== "left" || player.isInDialogue) return;

  const worldMousePos = k.toWorld(k.mousePos());
  player.moveTo(worldMousePos, player.speed);

  const mouseAngle = player.pos.Angle(worldMousePos)

  const lowerBound = 50;
  const upperBound = 125;

  if (
    mouseAngle > lowerBound &&
    mouseAngle < upperBound &&
    player.curAnim() !== "walk-up"
  ) {
    player.play("walk-up");
    player.direction = "up";
    return;
   }

   if (
    mouseAngle < -lowerBound &&
    mouseAngle > -upperBound &&
    player.curAnim() !== "walk-down"
  ) {
    player.play("walk-down");
    player.direction = "down";
    return;
   }

   if (Maths.abs(mouseAngle) > upperBound) {
    player.flipX = false;
    if (player.curAnim() !== "walk-side") player.play("walk-side")
      player.direction = "right";
    return;
   }
   if (Math.abs(mouseAngle) < lowerBound) {
      player.flipX = true;
      if (player.curAnim() !== "walk side") player.play("walk-side")
        player.direction = "left";
      return;
   }



 });

  k.onMouseRelease(() => {
    if (player.direction === "down") {
      player.play("idle-down");
      return
    }
    if (player.direction === "up") {
      player.play("idle-up");
      return
    }

    player.play("idle-side");


  })

});

k.go("main");
