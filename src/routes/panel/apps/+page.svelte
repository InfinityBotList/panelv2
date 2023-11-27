<script lang="ts">
	import { fetchClient, panelQuery } from '$lib/fetch';
	import { panelAuthState } from '$lib/panelAuthState';
	import { panelState } from '$lib/panelState';
	import Loading from '../../../components/Loading.svelte';
	import type { BaseSchema, Capability, Entry, FieldFetch, Schema } from '../../../components/admin/types';
	import logger from '$lib/logger';
	import View from '../../../components/admin/View.svelte';
	import { newField } from '../../../components/admin/helpers';
	import type { AppListResponse, AppResponse } from '$lib/generated/popplio/types';
	import type { Query } from '$lib/generated/htmlsanitize/Query';

	/* 
export interface AppResponse {
  app_id: string;
  user_id: string;
  questions: Question[];
  answers: { [key: string]: string};
  state: string;
  created_at: string;
  position: string;
  review_feedback?: string;
}
	*/

	class AppSchema implements BaseSchema<AppResponse>, Schema<AppResponse> {
		name: string = "apps";
		fields: FieldFetch<AppResponse> = [
			{
				id: "app_id",
				label: "App ID",
				type: "text",
				helpText: "The ID of the submitted application",
				required: true,
				disabled: true,
				renderMethod: "text",
			},
			{
				id: "user_id",
				label: "User ID",
				type: "text",
				helpText: "The User ID of the submitted application",
				required: true,
				disabled: true,
				renderMethod: "text",
			},
			{
				id: "questions",
				label: "Questions",
				type: "textarea",
				helpText: "The list of questions for the application",
				required: true,
				disabled: true,
				renderMethod: "custom[html]",
                customRenderer: async (cap: Capability, data: AppResponse) => {
                    logger.info("Data", data)
                    let content = `<ul class="desc questions">`
                    for(let q of data.questions) {
                        let query: Query = {
                            SanitizeRaw: {
                                body: data.answers[q.id] || ""
                            }
                        }

                        let res = await fetchClient(`${$panelState?.coreConstants?.htmlsanitize_url}/query`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify(query)
                        })

                        if(!res.ok) throw new Error(`Failed to sanitize HTML: ${await res.text()}`)

                        content += `
                            <li class="desc question-id">${q.id}</li>
                            <li class="desc question">${q.question}</li>
                            <li class="desc answer">${await res.text()}</li>
                            <li class="desc ext-info">
                                <ul>
                                    <li class="desc">Paragraph: ${q.paragraph}</li>
                                    <li class="desc">Placeholder: ${q.placeholder}</li>
                                    <li class="desc">Short: ${q.short}</li>
                                </ul>
                            </li>
                        `
                    }

                    content += `</ul>`

                    return content
                }
			},
            {
                id: "answers",
                label: "Answers",
                type: "text[kv]",
                helpText: "The list of answers for the application",
                required: true,
                disabled: true,
                renderMethod: "none",
            },
            {
				id: "state",
				label: "State",
				type: "text",
				helpText: "State of the submitted application currently",
				required: true,
				disabled: true,
				renderMethod: "text",
			},
            {
				id: "position",
				label: "Position",
				type: "text",
				helpText: "Position said application is applying for",
				required: true,
				disabled: true,
				renderMethod: "text",
			},
            {
				id: "review_feedback",
				label: "Review Feedback",
				type: "text",
				helpText: "The feedback while the application was being reviewed",
				required: true,
				disabled: true,
				renderMethod: "text",
			},
			async (cap: Capability) => {
				if(cap == "create") return null
				return newField("created_at", "Created At", "The date the changelog entry was created", false, true)
			}
		]

		strictSchemaValidation: boolean = true
		strictSchemaValidationIgnore: string[] = [];

		getCaps(): Capability[] {
            let caps: Capability[] = []
			if($panelState?.capabilities?.includes("ViewApps")) {
				caps.push("view")
			} else {
                throw new Error("You do not have permission to view apps")
            }

            if($panelState?.capabilities?.includes("ManageApps")) {
                caps.push("update")
            }

			return caps
		}

		getPrimaryKey(cap: Capability) {
			return "app_id"
		}

		async viewAll() {
			let res = await panelQuery({
				PopplioStaff: {
					login_token: $panelAuthState?.loginToken || '',
					path: "/staff/apps",
                    method: "GET",
                    body: ""
				}
			})

			if(!res.ok) throw new Error(`Failed to fetch changelog entries: ${await res.text()}`)

			let appRes: AppListResponse = await res.json()

			return appRes.apps
		}

		async view(key: string, value: string) {
			let entries = await this.viewAll()

			return entries.find(ce => {
				// @ts-ignore
				return ce[key] == value
			})
		}

		async create(data: Entry<AppResponse>) {
			throw new Error("Applications cannot be created through the panel")
		}

		async update(data: Entry<AppResponse>) {
			throw new Error("Applications cannot be updated through the panel yet")
		}

		async delete(data: Entry<AppResponse>) {
			throw new Error("Applications cannot be deleted through the panel")
		}

		async viewToTable(data: AppResponse[]) {
			return {
				fields: this.fields,
				data: data?.map(d => {
					return {
						...d,
						created_at: new Date(d?.created_at),
					}
				})
			}
		}

		async onOpen(cap: Capability, evt: string, data?: AppResponse) {
			logger.info("ChangelogSchema", "onOpen", { cap, evt, data })
		};

		warningBox(cap: Capability, data: AppResponse, func: () => Promise<boolean>) {
			switch (cap) {
				case "delete":
					return {
						header: 'Confirm Deletion',
						text: `Are you sure you want to delete app entry '${data.app_id}'? This is an irreversible action.`,
						buttonStates: {
							normal: 'Delete Changelog',
							loading: 'Deleting changelog...',
							success: 'Successfully deleted this changelog',
							error: 'Failed to delete changelog'
						},
						onConfirm: func
					}
				default:
					throw new Error(`Unsupported capability for warningBox: ${cap}`)
			}
		}

		constructor() {
			// Freeze all properties on the class
			for (let key of Object.keys(this)) {
				Object.defineProperty(this, key, {
					writable: false,
					configurable: false
				});
			}

			Object.freeze(this);
		}
	}

	let schema: AppSchema | undefined;

	$: {
		schema = new AppSchema()
	}
</script>

{#if schema}
	<View {schema}/>
{:else}
	<Loading msg="Internally creating apps schema..." />
{/if}