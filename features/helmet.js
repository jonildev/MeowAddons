import { FeatManager } from "./helperfunction"
import { LocalStore } from "../../tska/storage/LocalStore"
import Config from "../config"

let currentIndex = 0
let isInInventory = false
let delay = Config().spacehelmetdelay
const Helm = FeatManager.createFeature("spacehelmet")
const MeowDate = new Date()
const formattedDate = `${["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][MeowDate.getMonth()]}, ${MeowDate.getFullYear()}`
const damageValues = [14, 1, 4, 5, 13, 9, 11, 10, 6]
const GuiInventory = Java.type("net.minecraft.client.gui.inventory.GuiInventory")
const data = new LocalStore("MeowAddons", {
    helm: null,
    helmname: null
}, "./data/spacehelm.json")

Helm
    .register("stepFps", () => {
        if (!World.isLoaded()) return
        const inv = Player.getInventory()?.getInventory()
        if (!isInInventory) {
            const currentHelmet = inv?.field_70460_b[3]
            if (currentHelmet && !data.helm && !currentHelmet?.func_82833_r().includes("[MA]")) data.helm = currentHelmet, data.helmname = data.helm.func_82833_r()
            inv?.field_70460_b[3] = new Item("minecraft:stained_glass")
                .setDamage(damageValues[currentIndex])
                .setName("§r§cSpace Helmet &e[MA]")
                .setLore([
                    "§7§oA rare space helmet forged from", "§7§oshards of moon glass.", "", 
                    `§7To: &e[Meower]&c ${Player.getName()}`, "§7From: &e[MeowAddons]", "",
                    "§8Edition #0", `§8${formattedDate}`, "",
                    "§8This item can be reforged!",
                    "§c§lSPECIAL HELMET"
                ])
                .getItemStack()
            currentIndex = (currentIndex + 1) % damageValues.length
        } else if (data.helm !== null) {
            inv?.field_70460_b[3] = data.helm
            data.helmname = data.helm.func_82833_r()
            data.helm = null
        }
    }, delay)
    .register("ma:setSlot", (wind, slot, item, evn) => slot === 5 && item?.func_82833_r() === data.helmname && cancel(evn))
    .register("guiOpened", e => e.gui instanceof GuiInventory && (isInInventory = true))
    .register("guiClosed", () => (isInInventory = false))
    .onUnregister(() => data.helm && (Player.getInventory()?.getInventory().field_70460_b[3] = data.helm))

Config().getConfig().registerListener((oldv, newv) => (delay = newv))