export interface ParsedPDFData {
  text: string
  title?: string
  numPages: number
}

export class PDFJSParser {
  async parse(file: File): Promise<ParsedPDFData> {
    // PDF.jsを動的にインポート（クライアントサイドのみ）
    const pdfjsLib = await import('pdfjs-dist')

    // PDF.jsのワーカーを設定（v3用）
    const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.entry')
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker.default

    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

    let fullText = ''
    const numPages = pdf.numPages

    // 全ページのテキストを抽出
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()

      const pageText = textContent.items
        .map((item: any) => {
          if ('str' in item) {
            return item.str
          }
          return ''
        })
        .join(' ')

      fullText += pageText + '\n'
    }

    // メタデータからタイトルを取得
    const metadata = await pdf.getMetadata()
    const title = metadata.info?.Title as string | undefined

    return {
      text: fullText,
      title,
      numPages
    }
  }
}
