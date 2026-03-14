import { getChannel, getChannels, getMessages } from '../actions'
import { ChannelViewClient } from './channel-view-client'

type Props = {
  params: Promise<{ channelId: string }>
}

export default async function ChannelPage({ params }: Props) {
  const { channelId } = await params
  const [channelResult, messagesResult, channelsResult] = await Promise.all([
    getChannel(channelId),
    getMessages(channelId),
    getChannels(),
  ])

  if (channelResult.error || !channelResult.data) {
    return (
      <div className="flex h-[calc(100vh-var(--topbar-height)-3rem)] items-center justify-center">
        <p className="text-sm text-[var(--color-text-tertiary)]">
          Channel not found or you don&apos;t have access.
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-var(--topbar-height)-3rem)] overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)]">
      <ChannelViewClient
        channel={channelResult.data.channel}
        members={channelResult.data.members}
        initialMessages={messagesResult.data?.messages ?? []}
        initialHasMore={messagesResult.data?.hasMore ?? false}
        initialChannels={channelsResult.data ?? []}
      />
    </div>
  )
}
