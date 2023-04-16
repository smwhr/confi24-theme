
import { Amplify, Hub } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';

import { useQuery } from 'react-query'

import '@aws-amplify/ui-react/styles.css';
import './App.css'

import awsconfig from './aws-exports';

import { DataStore } from '@aws-amplify/datastore';
import { Theme, Vote } from './models';
import { useEffect, useState } from 'react';

Amplify.configure({...awsconfig, "aws_appsync_authenticationType": "AMAZON_COGNITO_USER_POOLS"});
type ThemeWithVote = Theme & {vote?: Vote, voteCount?: number};

Hub.listen('auth', async (data) => {
  if (data.payload.event === 'signOut') {
    await DataStore.clear();
  }
});

const useHub = (action: () => void) => Hub.listen("datastore", async hubData => {
  const  { event, data } = hubData.payload;
  if (event === "ready") {
    // do something here once the data is synced from the cloud
    action()
  }
})

function App({ signOut, user }:{signOut?:any, user?:any}) {

  const [ready, setReady] = useState<boolean>(false)
  const [themes, setThemes] = useState<Theme[]>([])
  const [votes, setVotes] = useState<Vote[]>([])
  const [themesWithVote, setThemesWithVote] = useState<ThemeWithVote[]>([])


  
  const { isLoading: themesLoading, error: themesError } = useQuery<any, QueryError, Theme[]>(
    `themes${ready}`, 
    async () =>{
      const models = await DataStore.query(Theme);
      return models;
    }, {onSuccess: setThemes})

  const { isLoading: votesLoading, error: votesError } = useQuery<any, QueryError, Vote[]>(
    `votes${ready}`, 
    async () =>{
      const models = await DataStore.query(Vote);
      return models;
    }, {onSuccess: setVotes})
  
  useHub(() => setReady(true))

  useEffect(() => {
    const mergeThemesWithVote = themes.map( t => {
      const vote = votes.find(v => v.themeID === t.id)
      return {...t, vote: vote}
    })

    setThemesWithVote(mergeThemesWithVote)
  }, [themes, votes])


  if(themesLoading || themesError){
    return <div>chargement des thèmes...</div>
  }
  if(votesLoading || votesError){
    return <div>chargement de vos votes...</div>
  }

  const voteFor = (theme: ThemeWithVote, value:number) => async () => {
    
    let newVote: Vote;
    if(theme.vote){
      newVote = await DataStore.save(
        Vote.copyOf(theme.vote, updated => {
          updated.value = value
        })
      );
    }else{
      const ballot = { 
        "value": value,
        "themeID": theme.id,
      }
      newVote = await DataStore.save(
        new Vote(ballot)
      );
    }
    
    const newThemesWithVote = themesWithVote.map( t => {
      if(t === theme){
        return {...t, vote: newVote}
      }else{
        return t;
      }
    })
    setThemesWithVote(newThemesWithVote)
    
  }

  const revealVoteCount = (theme: ThemeWithVote) => async () => {

    const actualTheme = themes.find(t => t.id === theme.id)
    const votes =  await actualTheme!.Votes
    const voteCount = await votes.toArray().then(vs => vs.length)
    
    const newThemesWithVote = themesWithVote.map( t => {
      if(t === theme){
        return {...t, voteCount: voteCount}
      }else{
        return t;
      }
    })
    setThemesWithVote(newThemesWithVote)
  }

  return (
    <>
      <p style={{"fontSize": "2em"}}>Vote pour le thème du Concours de fiction interactive francophone 2024</p>
      <p>Bonjour {user.attributes.preferred_username} <button onClick={signOut}>Sign out</button></p>
      
      <p>

      </p>

      <div>
        <table style={{"maxWidth": "450px", "margin": "0 auto"}}>
          <thead>
            <tr>
              <td><strong>Thème</strong></td>
              <td><strong>Votre vote</strong></td>
            </tr>
          </thead>
          <tbody>
            {themesWithVote.map(( t ) => {
              return <tr key={t.id}>
                  <td>{t.name}</td>
                  <td>
                    <button className={t.vote?.value === -1 ? "selected" : ""} onClick={voteFor(t, -1)}>-1</button>
                    <button className={t.vote?.value === 0 ? "selected" : ""} onClick={voteFor(t, 0)}>0</button>
                    <button className={t.vote?.value === +1 ? "selected" : ""} onClick={voteFor(t, +1)}>+1</button>
                  </td>
              </tr>
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default withAuthenticator(App)
