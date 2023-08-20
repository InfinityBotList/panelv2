<script>
    import OrderedList from "../components/OrderedList.svelte";
    import ListItem from "../components/ListItem.svelte";
	import InputText from "../components/InputText.svelte";
    import InputTextArea from "../components/InputTextArea.svelte";
</script>

<div>
    <h1 class="text-3xl font-semibold">Staff Login</h1>
    <p class="font-semibold text-lg">
        In order to login to the Arcadia instance, please follow the following steps in 
        the Infinity Bot List Staff Server ("Staff Center"):
    </p>
    <OrderedList>
        <ListItem>
            Run the following command `/rpc-login`
        </ListItem>
        <ListItem>
            Copy paste the 'Instance URL' and 'Login Token' given to you here
        </ListItem>
    </OrderedList>
    <p class="font-semibold text-lg">
        And if you're not staff... then keep out!
    </p>

    <hr class="my-4 text-black" />

    <InputText id="url" label="Instance URL" placeholder="https://panel.infinitybots.gg" minlength={1} />
    <InputTextArea id="url" label="Login Token" placeholder="SJSJSJSJSJSJSJSJJSJSJSJSJSJJ" minlength={1} />
</div>