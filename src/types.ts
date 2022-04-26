import { Aggro } from "./components/aggro"
import { Animation } from "./components/animation"
import { Drawable } from "./components/drawable"
import { Health } from "./components/health"
import { Hitbox } from "./components/hitbox"
import { Movement } from "./components/movement"
import { Resource } from "./components/resource"
import { Transform } from "./components/transform"

export type T_Component = (
    typeof Aggro |
    typeof Animation |
    typeof Drawable |
    typeof Health |
    typeof Hitbox |
    typeof Movement |
    typeof Resource |
    typeof Transform
)

export type T_ModelId = "modelDefault" | "modelImage" | "modelGround"
export type T_ProgramId = "programDefault" | "programBlur" | "programDesaturate"

export type T_ShaderId = (
    "vertDefault" |
    "vertImage" |

    "fragDefault" |
    "fragBlur" |
    "fragDesaturate"
)

export type T_HitboxType = "necrawmancer" | "friend" | "foe"

export type T_Tuple<T, length extends number, _array extends T[] = []> = _array["length"] extends length ? _array : T_Tuple<T, length, [T, ..._array]>
