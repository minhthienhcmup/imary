//
//  WidgetWriteDiary.swift
//  WidgetWriteDiary
//
//
//

import WidgetKit
import SwiftUI
import Intents

struct Shared:Decodable {
  let dateLogon: String,
      backgroundImage: String
}

struct Provider: IntentTimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
      SimpleEntry(date: Date(), backgroundImage: "", dateLogon: "", configuration: PrefixConfigurationIntent())
    }

    func getSnapshot(for configuration: PrefixConfigurationIntent, in context: Context, completion: @escaping (SimpleEntry) -> ()) {
      let entry = SimpleEntry(date: Date(), backgroundImage: "", dateLogon: "", configuration: configuration)
        completion(entry)
    }

    func getTimeline(for configuration: PrefixConfigurationIntent, in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        var entries: [SimpleEntry] = []
        var dateLog = ""
        var image = ""

        if let userDefaults = UserDefaults(suiteName: "group.com.imary") {
          dateLog = userDefaults.string(forKey: "date") ?? ""
          image = userDefaults.string(forKey: "backgroundImage") ?? ""
        }


        // Generate a timeline consisting of five entries an hour apart, starting from the current date.
        let currentDate = Date()
        for hourOffset in 0 ..< 5 {
          let entryDate = Calendar.current.date(byAdding: .second, value: hourOffset, to: currentDate)!
          let entry = SimpleEntry(date: entryDate, backgroundImage: image, dateLogon: dateLog, configuration: configuration)
          entries.append(entry)
        }

        let timeline = Timeline(entries: entries, policy: .atEnd)
        completion(timeline)
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let backgroundImage: String
    let dateLogon: String
    let configuration: PrefixConfigurationIntent
}

struct WidgetWriteDiaryEntryView : View {
    var entry: Provider.Entry

    func convertTime(of dateTo: Date) -> String {
      let dateFormatter = DateFormatter()
      dateFormatter.dateFormat = "HH:mm"
      let newDateString = dateFormatter.string(from: dateTo)
      return newDateString
    }

  func convertDate(of dateTo: Date) -> String {
    let dateFormatter = DateFormatter()
    dateFormatter.dateFormat = "yyyy/MM/dd EEE"
    let newDateString = dateFormatter.string(from: dateTo)
    print(entry.backgroundImage)
    return newDateString
  }

  func imageFromBase64(_ base64: String) -> UIImage? {
      if let url = URL(string: base64) {
          if let data = try? Data(contentsOf: url) {
              return UIImage(data: data)
          }
      }
      return nil
  }

    var body: some View {
      HStack {
        HStack {
          Image(uiImage: entry.backgroundImage.isEmpty ? UIImage(named: "white-bg")! : imageFromBase64(entry.backgroundImage)!)
              .resizable()
              .scaledToFill()
              .frame(width: 210, height: 169)
              .overlay(
                VStack(alignment: .trailing) {
                  VStack(alignment: .trailing) {
                    Text(convertTime(of: entry.date)).font(.system(size: 36, weight: .bold, design: .default)).offset(x: -6, y: 0)

                    Text(convertDate(of: entry.date)).font(.system(size: 14, weight: .bold, design: .default)).offset(x: -7, y: -5)
                  }.frame(width: 110, alignment: .trailing).background(Color.white.opacity(0.75))

                  VStack(alignment: .trailing) {
                    Text("Logged on " + entry.dateLogon).font(.system(size: 12, weight: .bold, design: .default)).frame(maxWidth: .infinity, alignment: .bottomTrailing).offset(x: -7, y: 0)
                  }.frame(width: 185).background(Color.white.opacity(0.75))
                }.offset(x: 0, y: -6), alignment: .bottom)
        }.frame(width: 210, height: 169)

        Spacer().frame(width: 0)

        HStack {
          Image(uiImage: UIImage(named: "WidgetBackground")!)
              .resizable()
              .scaledToFill()
            .frame(width: 150, height: 169)
            .overlay(
              VStack {
                HStack {
                  Link(destination: URL(string: "imary://Write/0")!) {
                    Image(uiImage: UIImage(named: "wg_diary")!)
                            .resizable()
                            .scaledToFill()
                      .frame(width: 58, height: 58).cornerRadius(26)
                          }

                  Spacer().frame(width: 11)

                  Link(destination: URL(string: "imary://Write/1")!) {
                  Image(uiImage: UIImage(named: "wg_camera")!)
                          .resizable()
                          .scaledToFit()
                          .frame(width: 58, height: 58).cornerRadius(26)                  }
                }

                Spacer().frame(height: 11)

                HStack {
                  Link(destination: URL(string: "imary://Search/0")!) {
                  Image(uiImage: UIImage(named: "wg_search")!)
                          .resizable()
                          .scaledToFit()
                    .frame(width: 58, height: 58).cornerRadius(26)
                  }

                  Spacer().frame(width: 11)

                  Link(destination: URL(string: "imary://Write/2")!) {
                  Image(uiImage: UIImage(named: "wg_video")!)
                          .resizable()
                          .scaledToFit()
                          .frame(width: 58, height: 58).cornerRadius(26)
                  }
                }
              }
              .offset(x: -5.5, y: 0), alignment: .center)
            }.widgetURL(URL(string: "imary://"))
        .frame(width: 150, height: 169)
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
        .supportedFamilies([.systemMedium])
    }
}

struct WidgetWriteDiary_Previews: PreviewProvider {
    static var previews: some View {
      WidgetWriteDiaryEntryView(entry: SimpleEntry(date: Date(), backgroundImage: "", dateLogon: "", configuration: PrefixConfigurationIntent()))
            .previewContext(WidgetPreviewContext(family: .systemSmall))
    }
}
