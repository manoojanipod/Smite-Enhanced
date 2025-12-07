import { useEffect, useState } from 'react'
import { Plus, Trash2, Edit2 } from 'lucide-react'
import api from '../api/client'

interface Tunnel {
  id: string
  name: string
  core: string
  type: string
  node_id: string
  spec: Record<string, any>
  status: string
  error_message?: string | null
  revision: number
  created_at: string
  updated_at: string
}

const Tunnels = () => {
  const [tunnels, setTunnels] = useState<Tunnel[]>([])
  const [nodes, setNodes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingTunnel, setEditingTunnel] = useState<Tunnel | null>(null)

  useEffect(() => {
    fetchData()
    const params = new URLSearchParams(window.location.search)
    if (params.get('create') === 'true') {
      setShowAddModal(true)
      window.history.replaceState({}, '', '/tunnels')
    }
  }, [])

  const fetchData = async () => {
    try {
      const [tunnelsRes, nodesRes] = await Promise.all([
        api.get('/tunnels'),
        api.get('/nodes'),
      ])
      setTunnels(tunnelsRes.data)
      setNodes(nodesRes.data)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteTunnel = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tunnel?')) return
    
    try {
      await api.delete(`/tunnels/${id}`)
      fetchData()
    } catch (error) {
      console.error('Failed to delete tunnel:', error)
      alert('Failed to delete tunnel')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading tunnels...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto" dir="rtl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">مدیریت تانل‌ها</h1>
          <p className="text-gray-500 dark:text-gray-400">مدیریت تونل‌های GOST / Rathole / Hysteria2 / WireGuard</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md flex items-center gap-2"
        >
          <Plus size={20} />
          ساخت تانل
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {tunnels.map((tunnel) => (
          <div
            key={tunnel.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 sm:p-6 transition-all hover:shadow-md"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {tunnel.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {tunnel.core === 'xray'
                    ? 'gost'
                    : tunnel.core === 'hysteria2'
                    ? 'Hysteria2'
                    : tunnel.core === 'wireguard'
                    ? 'WireGuard'
                    : tunnel.core}{' '}
                  / {tunnel.type}
                </p>
                {tunnel.node_id && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Node: {nodes.find(n => n.id === tunnel.node_id)?.name || tunnel.node_id}
                  </p>
                )}
              </div>
              <div className="flex gap-2 ml-2">
                <button
                  onClick={() => setEditingTunnel(tunnel)}
                  className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  title="Edit tunnel"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => deleteTunnel(tunnel.id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Delete tunnel"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {/* Error Message */}
            {tunnel.status === 'error' && tunnel.error_message && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-xs font-medium text-red-800 dark:text-red-200 mb-1">Error</p>
                <p className="text-sm text-red-700 dark:text-red-300">{tunnel.error_message}</p>
              </div>
            )}

            {/* Status Badge */}
            <div className="mb-4">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  tunnel.status === 'active'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                    : tunnel.status === 'error'
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}
              >
                {tunnel.status}
              </span>
            </div>
            
            {/* Port + extra details */}
            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-400">Listen Port</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {tunnel.spec?.listen_port ||
                    tunnel.spec?.remote_port ||
                    tunnel.spec?.port ||
                    'N/A'}
                </span>
              </div>

              {tunnel.core === 'rathole' && (
                <>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Rathole Port</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {tunnel.spec?.remote_addr ? tunnel.spec.remote_addr.split(':')[1] : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Local Port</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {tunnel.spec?.local_addr ? tunnel.spec.local_addr.split(':')[1] : 'N/A'}
                    </span>
                  </div>
                </>
              )}

              {tunnel.core === 'xray' &&
                (tunnel.spec?.forward_to ||
                  (tunnel.spec?.remote_ip && tunnel.spec?.remote_port)) && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Forward To</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white break-all ml-2">
                      {tunnel.spec.forward_to ||
                        `${tunnel.spec.remote_ip}:${tunnel.spec.remote_port}`}
                    </span>
                  </div>
                )}

              {tunnel.core === 'hysteria2' && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Speed</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {tunnel.spec?.down || '-'} ↓ / {tunnel.spec?.up || '-'} ↑
                  </span>
                </div>
              )}

              {tunnel.core === 'wireguard' && (
                <>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm text-gray-500 dark:text-gray-400">CIDR</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {tunnel.spec?.cidr || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Peers</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {tunnel.spec?.peers ?? 'N/A'}
                    </span>
                  </div>
                </>
              )}
            </div>

          </div>
        ))}
      </div>

      {showAddModal && (
        <AddTunnelModal
          nodes={nodes}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false)
            fetchData()
          }}
        />
      )}

      {editingTunnel && (
        <EditTunnelModal
          tunnel={editingTunnel}
          nodes={nodes}
          onClose={() => setEditingTunnel(null)}
          onSuccess={() => {
            setEditingTunnel(null)
            fetchData()
          }}
        />
      )}
    </div>
  )
}

interface EditTunnelModalProps {
  tunnel: Tunnel
  nodes: any[]
  onClose: () => void
  onSuccess: () => void
}

const EditTunnelModal = ({ tunnel, onClose, onSuccess }: EditTunnelModalProps) => {
  const remoteIp =
    tunnel.spec?.remote_ip ||
    (tunnel.spec?.forward_to ? tunnel.spec.forward_to.split(':')[0] : '127.0.0.1')
  const remotePort =
    tunnel.spec?.remote_port ||
    (tunnel.spec?.forward_to ? parseInt(tunnel.spec.forward_to.split(':')[1]) || 8080 : 8080)
  
  const [formData, setFormData] = useState({
    name: tunnel.name,
    port: tunnel.spec?.listen_port || tunnel.spec?.remote_port || tunnel.spec?.port || 8080,
    remote_ip: remoteIp,
    rathole_remote_addr: tunnel.spec?.remote_addr
      ? (tunnel.spec.remote_addr.includes(':')
          ? tunnel.spec.remote_addr.split(':')[1]
          : tunnel.spec.remote_addr)
      : '',
    rathole_local_port: tunnel.spec?.local_addr ? tunnel.spec.local_addr.split(':')[1] : '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const updatedSpec = { ...tunnel.spec }
      
      if (tunnel.core === 'rathole') {
        if (formData.rathole_remote_addr) {
          const remoteHost = window.location.hostname
          const remotePort =
            formData.rathole_remote_addr.includes(':')
              ? formData.rathole_remote_addr.split(':')[1]
              : formData.rathole_remote_addr
          updatedSpec.remote_addr = `${remoteHost}:${remotePort || '23333'}`
        }
        if (formData.rathole_local_port) {
          updatedSpec.local_addr = `127.0.0.1:${formData.rathole_local_port}`
        }
        const port =
          parseInt(formData.port.toString()) ||
          parseInt(formData.rathole_local_port) ||
          8090
        updatedSpec.remote_port = port
        updatedSpec.listen_port = port
      } else if (
        tunnel.core === 'xray' &&
        (tunnel.type === 'tcp' ||
          tunnel.type === 'udp' ||
          tunnel.type === 'grpc' ||
          tunnel.type === 'tcpmux')
      ) {
        const remoteIp = formData.remote_ip || '127.0.0.1'
        const port = parseInt(formData.port.toString()) || 8080
        updatedSpec.remote_ip = remoteIp
        updatedSpec.remote_port = port
        updatedSpec.listen_port = port
        updatedSpec.forward_to = `${remoteIp}:${port}`
      }

      await api.put(`/tunnels/${tunnel.id}`, {
        name: formData.name,
        spec: updatedSpec,
      })
      onSuccess()
    } catch (error) {
      console.error('Failed to update tunnel:', error)
      alert('Failed to update tunnel')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Edit Tunnel</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          {tunnel.core === 'xray' &&
            (tunnel.type === 'tcp' ||
              tunnel.type === 'udp' ||
              tunnel.type === 'grpc' ||
              tunnel.type === 'tcpmux') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Remote IP
                  </label>
                  <input
                    type="text"
                    value={formData.remote_ip}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        remote_ip: e.target.value || '127.0.0.1',
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    placeholder="127.0.0.1"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Target server IP address
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Port
                  </label>
                  <input
                    type="number"
                    value={formData.port}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        port: parseInt(e.target.value) || 8080,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    placeholder="8080"
                    min="1"
                    max="65535"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Port (same for panel and target server)
                  </p>
                </div>
              </>
            )}
          
          {tunnel.core === 'rathole' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Local Port
              </label>
              <input
                type="number"
                value={formData.port}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    port: parseInt(e.target.value) || 8080,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                min="1"
                max="65535"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Port on panel where clients will connect
              </p>
            </div>
          )}
          
          {tunnel.core === 'rathole' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rathole Port
                </label>
                <input
                  type="number"
                  value={
                    formData.rathole_remote_addr
                      ? formData.rathole_remote_addr.split(':')[1] ||
                        formData.rathole_remote_addr
                      : ''
                  }
                  onChange={(e) => {
                    const port = e.target.value
                    const host = window.location.hostname
                    setFormData({
                      ...formData,
                      rathole_remote_addr: port ? `${host}:${port}` : '',
                    })
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="23333"
                  min="1"
                  max="65535"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Rathole server port on panel (IP: {window.location.hostname})
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Local Port
                </label>
                <input
                  type="number"
                  value={formData.rathole_local_port}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rathole_local_port: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="8080"
                  min="1"
                  max="65535"
                />
              </div>
            </>
          )}
          
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface AddTunnelModalProps {
  nodes: any[]
  onClose: () => void
  onSuccess: () => void
}

const AddTunnelModal = ({ nodes, onClose, onSuccess }: AddTunnelModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    core: 'xray',
    type: 'tcp',
    node_id: '',
    port: 8080,
    remote_ip: '127.0.0.1',
    rathole_remote_addr: '23333',
    rathole_token: '',
    rathole_local_port: '8080',
    // Hysteria2
    hysteria_password: 'ChangeMe123',
    hysteria_up: '50 Mbps',
    hysteria_down: '200 Mbps',
    // WireGuard
    wg_cidr: '10.10.0.0/24',
    wg_peers: 5,
    wg_dns: '1.1.1.1, 8.8.8.8',
    wg_allowed_ips: '0.0.0.0/0, ::/0',
    spec: {} as Record<string, any>,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const spec = getSpecForType(formData.core, formData.type)
      
      if (
        formData.core === 'xray' &&
        (formData.type === 'tcp' ||
          formData.type === 'udp' ||
          formData.type === 'grpc' ||
          formData.type === 'tcpmux')
      ) {
        const remoteIp = formData.remote_ip || '127.0.0.1'
        const port = parseInt(formData.port.toString()) || 8080
        spec.remote_ip = remoteIp
        spec.remote_port = port
        spec.listen_port = port
        spec.forward_to = `${remoteIp}:${port}`
      }
      
      if (formData.core === 'rathole') {
        const remoteHost = window.location.hostname
        const remotePort = formData.rathole_remote_addr || '23333'
        spec.remote_addr = `${remoteHost}:${remotePort}`
        spec.token = formData.rathole_token
        spec.local_addr = `127.0.0.1:${formData.rathole_local_port}`
        const port =
          parseInt(formData.port.toString()) ||
          parseInt(formData.rathole_local_port) ||
          8090
        spec.remote_port = port
        spec.listen_port = port
      }

      if (formData.core === 'hysteria2') {
        const port = parseInt(formData.port.toString()) || 8448
        spec.port = port
        spec.password = formData.hysteria_password || 'ChangeMe123'
        spec.up = formData.hysteria_up || '50 Mbps'
        spec.down = formData.hysteria_down || '200 Mbps'
      }

      if (formData.core === 'wireguard') {
        const port = parseInt(formData.port.toString()) || 51820
        spec.port = port
        spec.cidr = formData.wg_cidr || '10.10.0.0/24'
        spec.peers = parseInt(formData.wg_peers.toString()) || 5
        spec.dns = formData.wg_dns
        spec.allowed_ips = formData.wg_allowed_ips || '0.0.0.0/0, ::/0'
      }
      
      const payload = {
        name: formData.name,
        core: formData.core,
        type: formData.type,
        node_id: formData.core === 'rathole' ? formData.node_id || null : null,
        spec: spec,
      }
      await api.post('/tunnels', payload)
      onSuccess()
    } catch (error) {
      console.error('Failed to create tunnel:', error)
      alert('Failed to create tunnel')
    }
  }

  const getSpecForType = (core: string, type: string): Record<string, any> => {
    const baseSpec: Record<string, any> = {}

    if (core === 'rathole') {
      return { ...baseSpec, remote_addr: '', token: '', local_addr: '127.0.0.1:8080' }
    }

    switch (type) {
      case 'grpc':
        return { ...baseSpec, service_name: 'GrpcService', uuid: generateUUID() }
      case 'udp':
        return { ...baseSpec, uuid: generateUUID(), header_type: 'none' }
      default:
        return baseSpec
    }
  }

  const handleCoreChange = (core: string) => {
    let newType = formData.type
    let newPort = formData.port

    if (core === 'rathole') {
      newType = core
      newPort = 8090
    } else if (core === 'hysteria2') {
      newType = 'server'
      newPort = 8448
    } else if (core === 'wireguard') {
      newType = 'server'
      newPort = 51820
    } else {
      if (newType === 'rathole' || newType === 'server') {
        newType = 'tcp'
      }
      newPort = 8080
    }

    setFormData({ ...formData, core, type: newType, port: newPort })
  }

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl my-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Create Tunnel</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            {formData.core === 'rathole' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Node
                </label>
                <select
                  value={formData.node_id}
                  onChange={(e) => setFormData({ ...formData, node_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  required={formData.core === 'rathole'}
                >
                  <option value="">Select a node</option>
                  {nodes.map((node) => (
                    <option key={node.id} value={node.id}>
                      {node.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Core
              </label>
              <select
                value={formData.core}
                onChange={(e) => handleCoreChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="xray">GOST</option>
                <option value="rathole">Rathole</option>
                <option value="hysteria2">Hysteria2</option>
                <option value="wireguard">WireGuard</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                disabled={
                  formData.core === 'rathole' ||
                  formData.core === 'hysteria2' ||
                  formData.core === 'wireguard'
                }
              >
                {formData.core === 'rathole' ? (
                  <option value={formData.core}>
                    {formData.core.charAt(0).toUpperCase() + formData.core.slice(1)}
                  </option>
                ) : formData.core === 'hysteria2' || formData.core === 'wireguard' ? (
                  <option value={formData.type}>Server</option>
                ) : (
                  <>
                    <option value="tcp">TCP</option>
                    <option value="udp">UDP</option>
                    <option value="grpc">gRPC</option>
                    <option value="tcpmux">TCPMux</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* GOST/Xray fields */}
          {formData.core === 'xray' &&
            (formData.type === 'tcp' ||
              formData.type === 'udp' ||
              formData.type === 'grpc' ||
              formData.type === 'tcpmux') && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Remote IP
                  </label>
                  <input
                    type="text"
                    value={formData.remote_ip}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        remote_ip: e.target.value || '127.0.0.1',
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    placeholder="127.0.0.1"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Target server IP address
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Port
                  </label>
                  <input
                    type="number"
                    value={formData.port}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        port: parseInt(e.target.value) || 8080,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    placeholder="8080"
                    min="1"
                    max="65535"
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Port (same for panel and target server)
                  </p>
                </div>
              </div>
            )}

          {/* Rathole fields */}
          {formData.core === 'rathole' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Local Port
                </label>
                <input
                  type="number"
                  value={formData.port}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      port: parseInt(e.target.value) || 8080,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  min="1"
                  max="65535"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Port on panel for clients to connect (should match local service port)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rathole Port
                </label>
                <input
                  type="number"
                  value={formData.rathole_remote_addr}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rathole_remote_addr: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="23333"
                  min="1"
                  max="65535"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Rathole server port on panel (IP: {window.location.hostname})
                </p>
              </div>
            </div>
          )}

          {formData.core === 'rathole' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Token
                </label>
                <input
                  type="text"
                  value={formData.rathole_token}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rathole_token: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="your-token"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Authentication token
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Local Port
                </label>
                <input
                  type="number"
                  value={formData.rathole_local_port}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rathole_local_port: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="8080"
                  min="1"
                  max="65535"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Local service port (127.0.0.1:{formData.rathole_local_port || '8080'})
                </p>
              </div>
            </div>
          )}

          {/* Hysteria2 fields */}
          {formData.core === 'hysteria2' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Port
                </label>
                <input
                  type="number"
                  value={formData.port}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      port: parseInt(e.target.value) || 8448,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="8448"
                  min="1"
                  max="65535"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <input
                  type="text"
                  value={formData.hysteria_password}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hysteria_password: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white font-mono"
                  placeholder="ChangeMe123"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Down
                </label>
                <input
                  type="text"
                  value={formData.hysteria_down}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hysteria_down: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="200 Mbps"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Up
                </label>
                <input
                  type="text"
                  value={formData.hysteria_up}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hysteria_up: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="50 Mbps"
                />
              </div>
            </div>
          )}

          {/* WireGuard fields */}
          {formData.core === 'wireguard' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Port
                  </label>
                  <input
                    type="number"
                    value={formData.port}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        port: parseInt(e.target.value) || 51820,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    placeholder="51820"
                    min="1"
                    max="65535"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    CIDR داخلی
                  </label>
                  <input
                    type="text"
                    value={formData.wg_cidr}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        wg_cidr: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    placeholder="10.10.0.0/24"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    تعداد Peers
                  </label>
                  <input
                    type="number"
                    value={formData.wg_peers}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        wg_peers: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    min="1"
                    max="256"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    DNS
                  </label>
                  <input
                    type="text"
                    value={formData.wg_dns}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        wg_dns: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    placeholder="1.1.1.1, 8.8.8.8"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Allowed IPs
                </label>
                <input
                  type="text"
                  value={formData.wg_allowed_ips}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      wg_allowed_ips: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="0.0.0.0/0, ::/0"
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Tunnel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Tunnels
