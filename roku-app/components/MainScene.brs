sub init()
    m.grid = m.top.FindNode("grid")
    m.player = m.top.FindNode("player")
    m.grid.SetFocus(true)
    m.grid.ObserveField("itemSelected", "onItemSelected")
    loadFeed()
end sub

sub loadFeed()
    feedText = ReadAsciiFile("pkg:/content/feed.json")
    feed = ParseJson(feedText)
    if feed = invalid or feed.items = invalid
        showFallbackContent()
        return
    end if

    root = CreateObject("roSGNode", "ContentNode")
    for each item in feed.items
        node = root.CreateChild("ContentNode")
        node.title = item.title
        node.description = item.description
        node.url = item.streamUrl
        node.streamFormat = item.streamFormat
    end for
    m.grid.content = root
end sub

sub showFallbackContent()
    root = CreateObject("roSGNode", "ContentNode")
    item = root.CreateChild("ContentNode")
    item.title = "Feed error"
    item.description = "Check pkg:/content/feed.json"
    m.grid.content = root
end sub

sub onItemSelected()
    index = m.grid.itemSelected
    if m.grid.content = invalid then return
    item = m.grid.content.GetChild(index)
    if item = invalid or item.url = invalid then return

    videoContent = CreateObject("roSGNode", "ContentNode")
    videoContent.title = item.title
    videoContent.url = item.url
    videoContent.streamFormat = item.streamFormat

    m.player.content = videoContent
    m.player.visible = true
    m.player.SetFocus(true)
    m.player.control = "play"
end sub

function onKeyEvent(key as String, press as Boolean) as Boolean
    if press and key = "back" and m.player.visible
        m.player.control = "stop"
        m.player.visible = false
        m.grid.SetFocus(true)
        return true
    end if
    return false
end function
