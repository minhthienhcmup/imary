//
//  WidgetWriteDiary.swift
//  WidgetWriteDiary
//
//
//

import WidgetKit
import SwiftUI
import Intents

struct Provider: IntentTimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), configuration: PrefixConfigurationIntent())
    }

    func getSnapshot(for configuration: PrefixConfigurationIntent, in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        let entry = SimpleEntry(date: Date(), configuration: configuration)
        completion(entry)
    }

    func getTimeline(for configuration: PrefixConfigurationIntent, in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        var entries: [SimpleEntry] = []

        // Generate a timeline consisting of five entries an hour apart, starting from the current date.
        let currentDate = Date()
        for hourOffset in 0 ..< 5 {
            let entryDate = Calendar.current.date(byAdding: .hour, value: hourOffset, to: currentDate)!
            let entry = SimpleEntry(date: entryDate, configuration: configuration)
            entries.append(entry)
        }

        let timeline = Timeline(entries: entries, policy: .atEnd)
        completion(timeline)
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let configuration: PrefixConfigurationIntent
}

struct WidgetWriteDiaryEntryView : View {
    var entry: Provider.Entry

    var body: some View {
      Group {
        Image(uiImage: UIImage(named: "WidgetBackground")!)
            .resizable()
            .scaledToFill()
            .frame(maxWidth: .infinity, maxHeight: .infinity)
          .overlay(Image(uiImage: UIImage(named: "Diary")!)
                    .scaledToFit()
                    .frame(width: 36, height: 36, alignment: .center), alignment: .center)
          .widgetURL(URL(string: "imary://Write/0"))

      }
    }
}

@main
struct WidgetWriteDiary: Widget {
    let kind: String = "WidgetWriteDiary"

    var body: some WidgetConfiguration {
        IntentConfiguration(kind: kind, intent: PrefixConfigurationIntent.self, provider: Provider()) { entry in
            WidgetWriteDiaryEntryView(entry: entry)
        }
        .configurationDisplayName("Diary Widget")
        .description("This is a diary widget.")
    }
}

struct WidgetWriteDiary_Previews: PreviewProvider {
    static var previews: some View {
        WidgetWriteDiaryEntryView(entry: SimpleEntry(date: Date(), configuration: PrefixConfigurationIntent()))
            .previewContext(WidgetPreviewContext(family: .systemSmall))
    }
}
