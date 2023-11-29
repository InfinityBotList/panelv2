import { get } from "svelte/store"
import { panelQuery } from "./fetch"
import { panelAuthState } from "./panelAuthState"
import type { PartialUser } from "./generated/arcadia/PartialUser"

export const fetchUser = async (id: string): Promise<PartialUser> => {
    // Check localStorage
    let cachedUser = localStorage.getItem(`user:${id}`)

    if(cachedUser) {
        return JSON.parse(cachedUser)
    }

    let res = await panelQuery({
        GetUserDetails: {
            user_id: id
        }
    })

    if(res.status == 500) {
        // Check if error contains "one row"
        let err = await res.json()

        if(err?.includes("one row")) {
            // Uncached user, force fetch from popplio
            let popplioRes = await panelQuery({
                PopplioStaff: {
                    login_token: get(panelAuthState)?.loginToken || "",
                    path: `/platform/user/${id}?platform=discord`,
                    method: "GET",
                    body: ""
                }
            })

            if(!popplioRes.ok) {
                throw new Error("Failed to fetch user")
            }

            let user: PartialUser = await popplioRes.json()

            localStorage.setItem(`user:${id}`, JSON.stringify(user))

            return user
        }
    }

    if(!res.ok) {
        throw new Error("Failed to fetch user")
    }

    let user: PartialUser = await res.json()

    localStorage.setItem(`user:${id}`, JSON.stringify(user))

    return user
}