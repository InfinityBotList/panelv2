<!--
    AnimatedBox is a box/card element that flips/animates when it becomes visible
-->

<div class="rounded-lg p-4 bot_card bg-themable-600/50 shadow-white/50 text-white">
	<div class="rounded-lg p-3 bg-black card_banner">
		<div class="flex justify-center items-center">
			<slot name="avatar" />
			<div class="items-center pl-4 mt-1 text-2xl">
				<span class="inline-block text-2xl font-semibold text-white line-clamp-1 tracking-tight">
					<slot name="display-name" />
				</span>
			</div>
		</div>
	</div>
	<div class="mt-3 rounded-lg bg-black/80 p-3 h-28">
		<p class="break-all text-white">
			<slot name="short" />
		</p>
	</div>
	<slot name="post-slot" />
</div>
