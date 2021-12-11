//
//  WidgetCameraDiary.swift
//  WidgetCameraDiary
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

struct WidgetCameraDiaryEntryView : View {
    var entry: Provider.Entry

    var body: some View {
      Group {
        Image(uiImage: UIImage(named: "WidgetBackground")!)
            .resizable()
            .scaledToFill()
            .frame(maxWidth: .infinity, maxHeight: .infinity)
          .overlay(Image(uiImage: UIImage(named: "Camera")!)
                    .scaledToFit()
                    .frame(width: 36, height: 36, alignment: .center), alignment: .center)
          .widgetURL(URL(string: "imary://Write/1"))

      }
  }
}

@main
struct WidgetCameraDiary: Widget {
    let kind: String = "WidgetCameraDiary"

    var body: some WidgetConfiguration {
        IntentConfiguration(kind: kind, intent: PrefixConfigurationIntent.self, provider: Provider()) { entry in
            WidgetCameraDiaryEntryView(entry: entry)
        }
        .configurationDisplayName("Camera Widget")
        .description("This is a camera widget.")
        .supportedFamilies([])
    }
}

struct WidgetCameraDiary_Previews: PreviewProvider {
    static var previews: some View {
        WidgetCameraDiaryEntryView(entry: SimpleEntry(date: Date(), configuration: PrefixConfigurationIntent()))
            .previewContext(WidgetPreviewContext(family: .systemSmall))
    }
}
