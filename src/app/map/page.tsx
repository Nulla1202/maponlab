'use client'

import dynamic from 'next/dynamic'
import { Loading } from '@/shared/components/Loading/Loading'
import { UploadButton } from '@/features/upload'
import { useUpload } from '@/features/upload'
import { usePapers } from '@/features/papers'

// 動的インポートでSSRを無効化（Leafletはクライアントサイドのみで動作）
const MapView = dynamic(
  () => import('@/features/map').then(mod => mod.MapView),
  {
    ssr: false,
    loading: () => <Loading size="lg" text="地図を読み込み中..." />
  }
)

const MapMarker = dynamic(
  () => import('@/features/map').then(mod => mod.MapMarker),
  { ssr: false }
)

export default function MapPage() {
  const { papers, loading: papersLoading, addPaper, deletePaper } = usePapers()
  const { uploadPaper, isLoading: uploadLoading, error, progress } = useUpload()

  const handleUpload = async (file: File) => {
    const paper = await uploadPaper(file)
    if (paper) {
      await addPaper(paper)
      alert(`論文「${paper.title}」をアップロードしました！\n著者: ${paper.authors.map(a => a.name).join(', ')}\n所属: ${paper.affiliations.length}件`)
    } else if (error) {
      alert(`エラー: ${error.message}`)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`論文「${title}」を削除しますか？`)) {
      try {
        await deletePaper(id)
        alert('削除しました')
      } catch (err) {
        alert('削除に失敗しました')
      }
    }
  }

  // 地図に表示するマーカーデータを準備
  const markers = papers.flatMap(paper => {
    const paperMarkers = paper.affiliations
      .filter(aff => aff.geoPoint !== null)
      .map((aff, index) => ({
        id: `${paper.id}-${index}`,
        geoPoint: aff.geoPoint!,
        title: paper.title,
        authors: paper.authors.map(a => a.name),
        affiliation: aff.name
      }))

    console.log(`論文「${paper.title}」: ${paper.affiliations.length}件の所属, ${paperMarkers.length}個のマーカー`)

    return paperMarkers
  })

  console.log(`総マーカー数: ${markers.length}`)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">論文地図</h1>
        <UploadButton onUpload={handleUpload} isLoading={uploadLoading} />
      </div>

      {/* プログレス表示 */}
      {progress && (
        <div className="mb-4 bg-blue-100 border border-blue-300 rounded-lg p-3">
          <p className="text-blue-800 font-medium">{progress}</p>
        </div>
      )}

      {/* エラー表示 */}
      {error && !progress && (
        <div className="mb-4 bg-red-100 border border-red-300 rounded-lg p-3">
          <p className="text-red-800 font-medium">エラー: {error.message}</p>
        </div>
      )}

      {/* 統計情報 */}
      <div className="mb-4 flex gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 flex-1">
          <p className="text-sm text-gray-600">論文数</p>
          <p className="text-2xl font-bold text-gray-900">{papers.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 flex-1">
          <p className="text-sm text-gray-600">マーカー数</p>
          <p className="text-2xl font-bold text-gray-900">{markers.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 flex-1">
          <p className="text-sm text-gray-600">国</p>
          <p className="text-2xl font-bold text-gray-900">
            {new Set(papers.flatMap(p => p.getUniqueCountries())).size}
          </p>
        </div>
      </div>

      {/* 地図 */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        {papersLoading ? (
          <div className="h-[600px] flex items-center justify-center">
            <Loading size="lg" text="論文データを読み込み中..." />
          </div>
        ) : (
          <MapView>
            {markers.map((marker) => (
              <MapMarker
                key={marker.id}
                geoPoint={marker.geoPoint}
                title={marker.title}
                authors={marker.authors}
                affiliation={marker.affiliation}
              />
            ))}
          </MapView>
        )}
      </div>

      {/* 使い方ガイド */}
      <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-green-900 mb-2">
          📄 使い方
        </h2>
        <ol className="list-decimal list-inside text-green-800 space-y-1">
          <li>右上の「PDFをアップロード」ボタンをクリック</li>
          <li>論文PDFファイルを選択</li>
          <li>自動で著者・所属機関を抽出</li>
          <li>ジオコーディングして地図にマーカー表示</li>
          <li>マーカーをクリックして詳細確認</li>
        </ol>
        {papers.length === 0 && (
          <p className="mt-3 text-green-700 font-medium">
            まだ論文がアップロードされていません。PDFをアップロードして始めましょう！
          </p>
        )}
      </div>

      {/* 論文リスト */}
      {papers.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            アップロード済み論文
          </h2>
          <div className="space-y-3">
            {papers.map((paper) => (
              <div key={paper.id} className="border border-gray-200 rounded-lg p-4 relative">
                <button
                  onClick={() => handleDelete(paper.id, paper.title)}
                  className="absolute top-4 right-4 text-red-500 hover:text-red-700 hover:bg-red-50 rounded p-2 transition-colors"
                  title="削除"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
                <h3 className="font-semibold text-gray-900 pr-10">{paper.title}</h3>

                <p className="text-sm text-gray-600 mt-2">
                  <span className="font-medium">著者:</span> {paper.authors.map(a => a.name).join(', ')}
                </p>

                <div className="mt-2">
                  <p className="text-sm text-gray-600 font-medium mb-1">
                    所属機関: {paper.affiliations.length}件 ({paper.affiliations.filter(a => a.geoPoint).length}件に座標あり)
                  </p>
                  {paper.affiliations.length > 0 && (
                    <ul className="text-sm text-gray-600 space-y-1 ml-4">
                      {paper.affiliations.map((aff, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="mr-2">
                            {aff.geoPoint ? (
                              <span className="text-green-500" title="座標あり">✓</span>
                            ) : (
                              <span className="text-red-500" title="座標なし">✗</span>
                            )}
                          </span>
                          <span>
                            {aff.name}
                            {aff.country && <span className="text-gray-500"> ({aff.country})</span>}
                            {aff.geoPoint && (
                              <span className="text-xs text-gray-400 ml-2">
                                ({aff.geoPoint.lat.toFixed(4)}, {aff.geoPoint.lon.toFixed(4)})
                              </span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  {new Date(paper.uploadedAt).toLocaleString('ja-JP')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
