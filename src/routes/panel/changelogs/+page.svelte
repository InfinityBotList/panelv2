<script lang="ts">
	import { panelQuery } from '$lib/fetch';
	import { panelAuthState } from '$lib/panelAuthState';
	import { panelState } from '$lib/panelState';
	import ErrorComponent from '../../../components/Error.svelte';
	import Loading from '../../../components/Loading.svelte';
	import type { ChangelogEntry } from '$lib/generated/arcadia/ChangelogEntry';
	import AddChangelog from './AddChangelog.svelte';
	import type { Readable } from 'svelte/store';
    import { DataHandler, Datatable, Th, ThFilter } from '@vincjo/datatables'
	import ListItem from '../../../components/ListItem.svelte';
	import UnorderedList from '../../../components/UnorderedList.svelte';
	import ManageChangelog from './ManageChangelog.svelte';

    interface ChangelogRow { 
        version: string, 
        added: Array<string>, 
        updated: Array<string>, 
        removed: Array<string>, 
        created_at: string, 
        extra_description: string, 
		github_html: string | null,
        prerelease: boolean
    }

    let rows: Readable<ChangelogRow[]>;
    
	const fetchChangelogList = async () => {
		let res = await panelQuery({
			UpdateChangelog: {
				login_token: $panelAuthState?.loginToken || '',
                action: "ListEntries"
			}
		});

		if (!res.ok) throw new Error('Failed to fetch partner list');

		let changelogEntries: ChangelogEntry[] = await res.json();

        let changelogRows: ChangelogRow[] = changelogEntries?.map(c => {
            return {
                version: c?.version,
                added: c?.added,
                updated: c?.updated,
                removed: c?.removed,
                created_at: c?.created_at,
                extra_description: c?.extra_description,
				github_html: c?.github_html || null,
                prerelease: c?.prerelease
            }
        });

        const handler = new DataHandler(changelogRows, { rowsPerPage: 10 })
        rows = handler.getRows()

		return {
			handler,
            changelogEntries,
            changelogRows
		};
	};
</script>

{#await fetchChangelogList()}
	<Loading msg="Fetching changelog list..." />
{:then data}
	<h1 class="text-3xl font-semibold">Changelog Management</h1>

	{#if $panelState?.capabilities?.includes("ChangelogManagement")}
		<AddChangelog />
	{:else}
		<div class="mb-3"></div>
	{/if}

	<Datatable handler={data.handler} search={false}>
        <table>
            <thead>
				<tr>
					<Th handler={data.handler} orderBy="version">Version</Th>
					<Th handler={data.handler} orderBy="added" align="left">Added</Th>
					<Th handler={data.handler} orderBy="updated" align="left">Updated</Th>
					<Th handler={data.handler} orderBy="removed" align="left">Removed</Th>
					<Th handler={data.handler} orderBy="extra_description">Extra Description</Th>
					<Th handler={data.handler} orderBy="prerelease">Prerelease</Th>	
					<Th handler={data.handler} orderBy="github_html">Github HTML</Th>
					<Th handler={data.handler} orderBy="created_at">Created At</Th>
					<Th handler={data.handler} orderBy="version">Actions</Th>
				</tr>
				<tr>
					<ThFilter handler={data.handler} filterBy="version" />
					<ThFilter handler={data.handler} filterBy="added" />
					<ThFilter handler={data.handler} filterBy="updated" />
					<ThFilter handler={data.handler} filterBy="removed" />
					<ThFilter handler={data.handler} filterBy="extra_description" />
					<ThFilter handler={data.handler} filterBy="prerelease" />
					<ThFilter handler={data.handler} filterBy="github_html" />
					<ThFilter handler={data.handler} filterBy="created_at" />
					<ThFilter handler={data.handler} filterBy="version" />
				</tr>
			</thead>
			<tbody>
                {#each $rows as row}
					<tr>
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
							{row.extra_description}
						</td>
						<td>
							{row.prerelease}
						</td>
						<td>
							{row.github_html ? row?.github_html : "-"}
						</td>
						<td>
							{new Date(row.created_at)}
						</td>
						<td>
							<ManageChangelog changelog={row} />
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</Datatable>
{:catch err}
	<ErrorComponent msg={`Failed to fetch partner list: ${err}`} />
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