<script lang="ts">
	import ErrorComponent from '../Error.svelte';
	import Loading from '../Loading.svelte';
	import type { Readable } from 'svelte/store';
    import { DataHandler, Datatable, Th, ThFilter } from '@vincjo/datatables'
	import ListItem from '../ListItem.svelte';
	import UnorderedList from '../UnorderedList.svelte';
	import type { Schema } from './types';
	import { castToArray, fetchFields } from './logic';
	import Manage from './Manage.svelte';
	import OrderedList from '../OrderedList.svelte';

    export let schema: Schema<any>;
    let rows: Readable<any[]>;
    
	const fetchData = async () => {
        let viewData = await schema?.viewAll()

        if(!viewData) viewData = []

        let eRows = await schema?.viewToTable(viewData);

        const handler = new DataHandler(eRows.data, { rowsPerPage: 10 })
        rows = handler.getRows()

        let fields = fetchFields('view', eRows.fields)
        let pkey = schema?.getPrimaryKey('view')

		return {
			handler,
            eRows,
            fields,
            pkey,
            viewData
		};
	};
</script>

{#await fetchData()}
	<Loading msg="Fetching entries..." />
{:then data}
	{#if schema?.getCaps()}
		<!--<Add />-->
	{:else}
		<div class="mb-3"></div>
	{/if}

	<Datatable handler={data.handler} search={false}>
        <table>
            <thead>
				<tr>
                    {#each data.fields as f}
                        <Th handler={data.handler} orderBy={f.id}>{f.label}</Th>
                    {/each}
                    <Th handler={data.handler} orderBy={data.pkey}>Manage</Th>
				</tr>
				<tr>
                    {#each data.fields as f}
                        <ThFilter handler={data.handler} filterBy={f.id} />
                    {/each}
                    <ThFilter handler={data.handler} filterBy={data.pkey} />
				</tr>
			</thead>
			<tbody>
                {#each $rows as row}
					<tr>
                        {#each data.fields as field}
                            {#if field.renderMethod == "text"}
                                <td>
                                    {row[field.id]}
                                </td>
                            {:else if field.renderMethod == "unordered-list"}
                                <td>
                                    <UnorderedList>    
                                        {#each castToArray(row[field.id]) as cols}
                                            <ListItem>{cols}</ListItem>
                                        {/each}
                                    </UnorderedList>
                                </td>
                            {:else if field.renderMethod == "ordered-list"}
                            <td>
                                <OrderedList>    
                                    {#each castToArray(row[field.id]) as cols}
                                        <ListItem>{cols}</ListItem>
                                    {/each}
                                </OrderedList>
                            </td>
                            {/if}
                        {/each}
						<td>
							{row.version}
						</td>
						<td>
							<UnorderedList>
								{#each row.added as added}
									<ListItem>{added}</ListItem>
								{/each}
							</UnorderedList>
						</td>
						<td>
							<UnorderedList>
								{#each row.updated as updated}
									<ListItem>{updated}</ListItem>
								{/each}
							</UnorderedList>
						</td>
						<td>
							<UnorderedList>
								{#each row.removed as removed}
									<ListItem>{removed}</ListItem>
								{/each}
							</UnorderedList>
						</td>
						<td>
                            <Manage data={{
                                schema,
                                manageData: data.viewData.find(v => v?.[data.pkey] == row?.[data.pkey])
                            }} />
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</Datatable>
{:catch err}
	<ErrorComponent msg={`Failed to fetch schema view: ${err}`} />
{/await}

<style>
    table {
        color: white;
        width: 210%;
        margin: 0 !important;
    }
    tbody td {
        border: 1px solid #f5f5f5;
        padding: 4px 20px;
    }
    tbody tr {
        transition: all, 0.2s;
    }
    tbody tr:hover {
        background: #252323;
    }
</style>