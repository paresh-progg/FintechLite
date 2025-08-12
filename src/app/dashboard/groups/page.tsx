
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Users, ArrowRight } from 'lucide-react';
import type { Group } from '@/lib/types';
import AddGroupDialog from '@/components/dashboard/groups/add-group-dialog';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { getGroups, addGroup } from '@/lib/firestore';
import { Skeleton } from '@/components/ui/skeleton';

export default function GroupsPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isAddGroupDialogOpen, setIsAddGroupDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const unsubscribe = getGroups(user.uid, (groups) => {
        setGroups(groups);
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
        setLoading(false);
    }
  }, [user]);

  const handleAddGroup = async (group: Omit<Group, 'id'>) => {
    if (!user) return;
    const newGroup = { ...group, id: crypto.randomUUID() };
    await addGroup(user.uid, newGroup);
    setIsAddGroupDialogOpen(false);
  };

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Groups</h1>
          <Button onClick={() => setIsAddGroupDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Group
          </Button>
        </div>
        {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-40" />
                <Skeleton className="h-40" />
                <Skeleton className="h-40" />
            </div>
        ) : groups.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <Card key={group.id}>
                <CardHeader>
                  <CardTitle>{group.name}</CardTitle>
                  <CardDescription>{group.members.length} members</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="flex -space-x-2 overflow-hidden">
                        {group.members.slice(0,5).map(member => (
                            <div key={member.id} title={member.name} className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800 bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                                {member.name.charAt(0).toUpperCase()}
                            </div>
                        ))}
                        {group.members.length > 5 && <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800 bg-muted text-muted-foreground flex items-center justify-center text-xs font-bold">+{group.members.length - 5}</div>}
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/groups/${group.id}`}>
                        Manage <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center p-8 border-2 border-dashed rounded-lg">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold text-foreground">No groups yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Get started by creating a new group for your shared expenses.</p>
            <div className="mt-6">
              <Button onClick={() => setIsAddGroupDialogOpen(true)}>
                <PlusCircle className="-ml-0.5 mr-1.5 h-5 w-5" />
                Create Group
              </Button>
            </div>
          </div>
        )}
      </div>
      <AddGroupDialog
        open={isAddGroupDialogOpen}
        onOpenChange={setIsAddGroupDialogOpen}
        onAddGroup={handleAddGroup}
      />
    </>
  );
}
