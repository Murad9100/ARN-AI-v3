signUp: async (email: string, password: string, fullName: string) => {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  if (data.user) {
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      email,
      full_name: fullName,
      plan: 'free',
      tokens_used: 0,
      tokens_limit: 50,
    })
    if (profileError) throw profileError  // ← bu yox idi
  }
},

fetchProfile: async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    set({ user: null, loading: false })
    return
  }
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile) {
    set({ user: profile as User, loading: false })
  } else {
    // ← Profile yoxdursa, yarat (fallback)
    const { data: newProfile } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name ?? '',
        plan: 'free',
        tokens_used: 0,
        tokens_limit: 50,
      })
      .select()
      .single()
    set({ user: newProfile as User ?? null, loading: false })
  }
},
