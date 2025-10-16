import { Button } from '@/shared/components/Button/Button'
import { appConfig } from '@/config/app.config'

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
          {appConfig.name}
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          {appConfig.description}
        </p>
        <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
          <div className="rounded-md shadow">
            <a href="/map">
              <Button size="lg" className="w-full sm:w-auto">
                地図を見る
              </Button>
            </a>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-primary-600 text-3xl mb-4">📤</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              論文をアップロード
            </h3>
            <p className="text-gray-600">
              PDFファイルをドラッグ&ドロップするだけで簡単にアップロードできます。
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-primary-600 text-3xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              自動解析
            </h3>
            <p className="text-gray-600">
              著者名と所属機関を自動で抽出し、地理座標に変換します。
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-primary-600 text-3xl mb-4">🗺️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              地図で可視化
            </h3>
            <p className="text-gray-600">
              世界地図上に所属機関をピン表示し、研究ネットワークを俯瞰できます。
            </p>
          </div>
        </div>
      </div>

      <div className="mt-16 bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          使い方
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>論文PDFをアップロード</li>
          <li>著者情報と所属機関が自動で抽出されます</li>
          <li>地図ページで可視化された研究ネットワークを確認</li>
          <li>ピンをクリックして詳細情報を表示</li>
        </ol>
      </div>
    </div>
  )
}
