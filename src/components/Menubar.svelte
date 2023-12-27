<script lang="ts">
	import { page } from '$app/stores';
	import { logoutUser } from '$lib/logout';
	import { panelAuthState } from '$lib/panelAuthState';

	interface MenuItem {
		Name: String;
		Href: string | (() => any);
		Current: boolean;
	}

	let Navigation: MenuItem[] = [
		{
			Name: 'Home',
			Href: '/',
			Current: true
		}
	];

	const classNames = (...classes: any) => {
		return classes.filter(Boolean).join(' ');
	};

	$: {
		Navigation = [
			{
				Name: 'Home',
				Href: '/',
				Current: true
			}
		];

		Navigation.map((p) => {
			if (p.Href === $page.url.pathname) p.Current = true;
		});

		if ($panelAuthState?.loginToken)
			Navigation = [
				...Navigation,
				{
					Name: 'Logout',
					Href: () => {
						logoutUser(true);
						return true;
					},
					Current: false
				}
			];
	}

	const openMobileMenu = () => {
		const menu = document.getElementById('mobile-menu') as HTMLDivElement;
		const menuIcon: any = document.getElementById('menuIcon') as HTMLElement;
		const closeIcon: any = document.getElementById('closeIcon') as HTMLElement;
		const currentClass = menu.className;

		if (currentClass === 'hidden') {
			menu.className = 'block';
			menuIcon.className.baseVal = 'hidden h-6 w-6';
			closeIcon.className.baseVal = 'block h-6 w-6';
		} else {
			menu.className = 'hidden';
			menuIcon.className.baseVal = 'block h-6 w-6';
			closeIcon.className.baseVal = 'hidden h-6 w-6';
		}
	};
</script>

<nav>
	<div class="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
		<div class="relative flex h-16 items-center justify-between">
			<div class="absolute inset-y-0 left-0 flex items-center sm:hidden">
				<button
					type="button"
					class="inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
					on:click={openMobileMenu}
					aria-controls="mobile-menu"
					aria-expanded="false"
				>
					<span class="sr-only">Open main menu</span>
					<svg
						class="block h-6 w-6"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						aria-hidden="true"
						id="menuIcon"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
						/>
					</svg>
					<svg
						class="hidden h-6 w-6"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						aria-hidden="true"
						id="closeIcon"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
			<div class="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
				<div class="flex flex-shrink-0 items-center">
					<img
						class="block h-8 w-auto lg:hidden"
						src="https://cdn.infinitybots.gg/core/full_logo.webp"
						alt="Infinity Panel"
					/>
					<img
						class="hidden h-8 w-auto lg:block"
						src="https://cdn.infinitybots.gg/core/full_logo.webp"
						alt="Infinity Panel"
					/>

					<h2 class="text-base font-bold text-white ml-2">Infinity Panel</h2>
				</div>
				<div class="hidden sm:ml-6 sm:block">
					<div class="flex space-x-4">
						{#each Navigation as item}
							{#if typeof item.Href === 'string'}
								<a
									href={item.Href}
									class={classNames(
										item.Current ? 'bg-indigo-600 text-white' : 'text-white hover:bg-indigo-300',
										'px-3 py-2 rounded-md text-sm font-medium'
									)}
									aria-current={item.Current ? 'page' : undefined}
								>
									{item.Name}
								</a>
							{:else}
								<button
									on:click={item.Href()}
									class={classNames(
										item.Current ? 'bg-indigo-600 text-white' : 'text-white hover:bg-indigo-300',
										'px-3 py-2 rounded-md text-sm font-medium'
									)}
									aria-current={item.Current ? 'page' : undefined}
								>
									{item.Name}</button
								>
							{/if}
						{/each}
					</div>
				</div>
			</div>
		</div>

		<div class="hidden" id="mobile-menu">
			<div class="space-y-1 px-2 pt-2 pb-3">
				{#each Navigation as item}
					{#if typeof item.Href === 'string'}
						<a
							href={item.Href}
							class={classNames(
								item.Current
									? 'bg-indigo-600 text-white'
									: 'text-gray-300 hover:bg-gray-700 hover:text-white',
								'block px-3 py-2 rounded-md text-base font-medium'
							)}
							aria-current={item.Current ? 'page' : undefined}
						>
							{item.Name}
						</a>
					{:else}
						<button
							on:click={item.Href()}
							class={classNames(
								item.Current
									? 'bg-indigo-600 text-white'
									: 'text-gray-300 hover:bg-gray-700 hover:text-white',
								'block px-3 py-2 rounded-md text-base font-medium'
							)}
							aria-current={item.Current ? 'page' : undefined}
						>
							{item.Name}
						</button>
					{/if}
				{/each}
			</div>
		</div>
	</div>
</nav>
