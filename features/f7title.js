import { FeatManager, hud } from "./helperfunction"
import { Render2D } from "../../tska/rendering/Render2D"
import Dungeon from "../../tska/skyblock/dungeon/Dungeon"
import Config from "../config"

const F7Crush = FeatManager.createFeature("f7title-crush", "catacombs")
const F7Necron = FeatManager.createFeature("f7title-necron", "catacombs")
const F7DeadTitles = FeatManager.createFeature("f7title-dead", "catacombs")
const F7P3Timer = FeatManager.createFeature("f7p3timer", "catacombs")
const RagNotif = FeatManager.createFeature("m7ragtitle", "catacombs")
const WishTitle = FeatManager.createFeature("healtitle", "catacombs")
const TankTitle = FeatManager.createFeature("tanktitle", "catacombs")

const GUI = hud.createTextHud("Time until P3 starts (F7)", 240, 20, "&cP3 timer: &b4.8s")
const BossBar = Java.type("net.minecraft.entity.boss.BossStatus")

let [NecronDead, GoldorDead, MaxorDead] = [false, false, false]
let [StormDeath, GoldorDeath] = [0, 0]
let P3timer = false
let P3time = 104

F7Crush
    .register("chat", (msg) => {
        if (msg == "[BOSS] Maxor: YOU TRICKED ME!" || msg == "[BOSS] Maxor: THAT BEAM! IT HURTS! IT HURTS!!") 
            Render2D.showTitle(`&5Maxor Crushed`, null, 2000)
        if (msg == "[BOSS] Storm: Oof" || msg == "[BOSS] Storm: Ouch, that hurt!") 
            Render2D.showTitle(`&5Storm Crushed`, null, 2000)
    }, "${msg}")
F7Necron
    .register("chat", () => Render2D.showTitle(`&cNecron damageable`, null, 2000), "[BOSS] Necron: ARGH!")
F7DeadTitles
    .register("servertick", () => {
        if (!Dungeon.inBoss()) return
        if (BossBar.field_82827_c?.removeFormatting()?.includes("Necron") && BossBar.field_82828_a * 100 == 0.33333334140479565 
            && !NecronDead && Date.now - GoldorDeath > 10000)
            NecronDead = true, 
            Render2D.showTitle(`&cNecron Dead`, null, 2000)
        if (BossBar.field_82827_c?.removeFormatting()?.includes("Goldor") && BossBar.field_82828_a * 100 == 0.33333334140479565 
            && !GoldorDead && Date.now - StormDeath > 10000) 
            GoldorDead = true,
            GoldorDeath = Date.now(),
            Render2D.showTitle(`&cGoldor Dead`, null, 2000)
        if (BossBar.field_82827_c?.removeFormatting()?.includes("Maxor") && BossBar.field_82828_a * 100 == 0.33333334140479565 && !MaxorDead) 
            MaxorDead = true,
            Render2D.showTitle(`&cMaxor Dead`, null, 2000)
    })
    .register("chat", () => {
        Render2D.showTitle(`&cStorm Dead`, null, 2000)
        StormDeath = Date.now()
    }, "[BOSS] Storm: I should have known that I stood no chance.")
    .onRegister(() => {
        NecronDead = GoldorDead = MaxorDead = false
        StormDeath = GoldorDeath = 0
    })
F7P3Timer
    .register("chat", () => {
        P3timer = true
        F7P3Timer.update()
    }, "[BOSS] Storm: I should have known that I stood no chance.")
    .register("servertick", () => {
        if (P3time && P3timer && Dungeon.inBoss()) P3time--
        if (P3time <= 1) P3timer = false, F7P3Timer.update(), P3time = 104
    })
    .registersub("renderOverlay", () => {
        Renderer.translate(GUI.getX(), GUI.getY())
        Renderer.scale(GUI.getScale())
        Renderer.drawString(`&cP3 Timer: &b${P3time / 20}s`, 0, 0, false)
        Renderer.finishDraw()
    }, () => P3timer && Dungeon.inBoss())

GUI.onDraw(() => {
    Renderer.translate(GUI.getX(), GUI.getY())
    Renderer.scale(GUI.getScale())
    Renderer.drawString(`&cP3 Timer: &b4.8s`, 0, 0, false)
    Renderer.finishDraw()
})

Dungeon.on270Score(() => Config().dungeonscore270 && ChatLib.command(`pc ${Config().dungeonscore270msg}`))
Dungeon.on300Score(() => Config().dungeonscore300 && ChatLib.command(`pc ${Config().dungeonscore300msg}`))

WishTitle
    .register("chat", () => {
        if (Dungeon.getCurrentClass() === "Healer") Render2D.showTitle("&cWish!", null, 2000)
    }, /(⚠ Maxor is enraged! ⚠|\[BOSS\] Goldor: You have done it, you destroyed the factory…|\[BOSS\] Sadan: My giants! Unleashed!)/)
TankTitle
    .register("chat", () => Dungeon.getCurrentClass() === "Tank" && Render2D.showTitle("&cUlt!", null, 2000), "⚠ Maxor is enraged! ⚠")
RagNotif
    .register("chat", () => Dungeon.inBoss() && Render2D.showTitle("&cRag axe!", null, 2000), "[BOSS] Wither King: I no longer wish to fight, but I know that will not stop you.")