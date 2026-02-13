import { useEffect, useState } from "react";
import { db } from "@backend/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, UserMinus, ShieldCheck, Mail, Search, Leaf, Heart, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const AdminUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApproveUser = async (userId: string) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { approved: true });
      toast.success("User approved successfully");
      fetchUsers();
    } catch (error: any) {
      toast.error("Failed to approve user: " + error.message);
    }
  };

  const filteredUsers = users.filter(user =>
    (user.organizationName || "").toLowerCase().includes(search.toLowerCase()) ||
    (user.firstName || "").toLowerCase().includes(search.toLowerCase()) ||
    (user.lastName || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground text-sm">Review, approve, or manage platform users.</p>
      </div>

      <div className="flex items-center gap-4 bg-card p-4 rounded-lg border">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Badge variant="outline" className="ml-auto">{filteredUsers.length} total users</Badge>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User / Organization</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="font-medium text-foreground">
                    {user.organizationName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User'}
                  </div>
                  {user.organizationName && (
                    <div className="text-xs text-muted-foreground">{user.firstName} {user.lastName}</div>
                  )}
                  {user.role === 'ngo' && !user.approved && (
                    <Badge variant="destructive" className="ml-2 text-[10px]">Pending Approval</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {user.role === 'admin' && <Badge variant="default" className="bg-primary"><ShieldCheck className="w-3 h-3 mr-1" /> Admin</Badge>}
                    {user.role === 'donor' && <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200"><Leaf className="w-3 h-3 mr-1" /> Donor</Badge>}
                    {user.role === 'ngo' && <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200"><Heart className="w-3 h-3 mr-1" /> NGO</Badge>}
                    {!['admin', 'donor', 'ngo'].includes(user.role) && <Badge variant="outline">{user.role || 'User'}</Badge>}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1 text-xs">
                    <span className="flex items-center text-muted-foreground">
                      <Mail className="h-3 w-3 mr-1" /> Verified
                    </span>
                    <span className="text-foreground">{user.phone || 'No phone'}</span>
                    {user.website && <span className="text-muted-foreground truncate max-w-[120px]">{user.website}</span>}
                  </div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  <div className="flex flex-col">
                    <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
                    {user.registrationNumber && <span className="text-[10px] font-mono">Reg: {user.registrationNumber}</span>}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {user.role === 'ngo' && !user.approved && (
                      <Button size="sm" className="h-8 bg-green-600 hover:bg-green-700" onClick={() => handleApproveUser(user.id)} title="Approve NGO">
                        <Check className="h-4 w-4 mr-1" /> Approve
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Manage Permissions">
                      <ShieldCheck className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Suspend User">
                      <UserMinus className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No users found matching your criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminUsers;
