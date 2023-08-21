<script>
    import OrderedList from "../components/OrderedList.svelte";
    import ListItem from "../components/ListItem.svelte";
	import InputText from "../components/InputText.svelte";
</script>

<div>
    <h1 class="text-3xl font-semibold">Staff Login</h1>
    <p class="font-semibold text-lg">
        In order to login to the Arcadia instance, please input the 'Instance URL'. 
        <br/>
        <br/>
        Note that the default instance URL is <code>https://panel.infinitybots.gg</code> and 
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

    <InputText id="url" label="Instance URL" placeholder="https://panel.infinitybots.gg" minlength={1} />
</div>