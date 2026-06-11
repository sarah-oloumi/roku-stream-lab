sub init()
    m.title = m.top.FindNode("title")
    m.description = m.top.FindNode("description")
end sub

sub onItemContentChanged()
    item = m.top.itemContent
    if item <> invalid
        m.title.text = item.title
        m.description.text = item.description
    end if
end sub
