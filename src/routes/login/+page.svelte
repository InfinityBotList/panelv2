<script lang="ts">
    import OrderedList from "../../components/OrderedList.svelte";
    import ListItem from "../../components/ListItem.svelte";
	import InputText from "../../components/InputText.svelte";
	import ButtonReact from "../../components/ButtonReact.svelte";
	import type { LoginOp } from "../../utils/generated/arcadia/LoginOp";
	import { toast } from "@zerodevx/svelte-toast";
	import { error } from "$lib/toast";
	import type { PanelState } from "$lib/panelState";

    let instanceUrl = "https://prod--panel-api.infinitybots.gg"

    const login = async () => {
        let lp: LoginOp = {
            GetLoginUrl: {
                version: 0,
                redirect_url: `${window.location.origin}/login/authorize`
            }
        }

        let res = await fetch(`${instanceUrl}/authorize`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(lp)
        })

        if(!res.ok) {
            error("Failed to get login URL")
            return
        }

        let loginUrl = await res.text()

        // Open login URL in new tab using window.open
        let loginTab = window.open(loginUrl, "_blank")

        // Listen to message events
        window.addEventListener("message", async (e) => {
            // Check if the message is from the login tab
            if(e.source === loginTab) {
                loginTab?.close()     
                
                // Get URL from message
                let url = new URLSearchParams(loginTab?.location.search || '')

                let code = url.get("code")

                if(!code) {
                    error("Failed to get code from login URL")
                    return
                }

                let lp: LoginOp = {
                    Login: {
                        code: code,
                        redirect_url: `${window.location.origin}/login/authorize`
                    },
                }

                let res = await fetch(`${instanceUrl}/authorize`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(lp)
                })

                if(!res.ok) {
                    error("Failed to login")
                    return
                }

                let loginRes = await res.text()

                let ps: PanelState = {
                    url: instanceUrl,
                    loginToken: loginRes
                }

                localStorage.setItem("panelStateData", JSON.stringify(ps))

                let redirect = url.get("redirect")

                if(!redirect || !redirect.startsWith("/")) {
                    redirect = "/"
                }

                window.location.href = redirect
            }
        })
    }
</script>

<article>
    <h1 class="text-3xl font-semibold">Staff Login</h1>
    <p class="font-semibold text-lg">
        In order to login to the Arcadia instance, please input the 'Instance URL'. 
        <br/>
        <br/>
        Note that the default instance URL is <code>https://prod--panel-api.infinitybots.gg</code> and 
        should be valid. If you wish to use a custom instance URL, please change this URL here.
    </p>
    <OrderedList>
        <ListItem>
            See #info in the staff server to check the status of panel if Login does not work
        </ListItem>
        <ListItem>
            Copy-paste any special 'Instance URL' given to you here
        </ListItem>
    </OrderedList>
    <p class="font-semibold text-lg">
        And if you're not staff... then keep out!
    </p>

    <hr class="my-4 text-black" />

    <InputText bind:value={instanceUrl} id="url" label="Instance URL" placeholder="https://prod--panel-api.infinitybots.gg" minlength={1} />

    <ButtonReact onclick={() => login()}>Login</ButtonReact>
</article>